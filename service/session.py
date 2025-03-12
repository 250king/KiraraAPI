import secrets
import redis
import util.xray.app.proxyman.command.command_pb2 as command
from env import Env
from fastapi import HTTPException
from model.data.init import InitOperation
from model.data.user import User
from util.api import to_typed_message, GrpcClient
from util.config import make_config
from util.string import email_hash
from util.xray.common.protocol.user_pb2 import User as XrayUser
from util.xray.proxy.trojan.config_pb2 import Account


class SessionService:
    def __init__(self):
        # noinspection PyArgumentList
        self.env = Env()
        self.cache = redis.Redis(self.env.redis_host)

    # noinspection PyUnresolvedReferences
    def init(self, user: User, payload: InitOperation):
        self.revoke(user, payload.region)
        if not any(i.region == payload.region for i in self.env.endpoints):
            raise HTTPException(status_code=404)
        client = GrpcClient(payload.region)
        password = secrets.token_urlsafe(32)
        client.handler.AlterInbound(command.AlterInboundRequest(
            tag="default",
            operation=to_typed_message(
                command.AddUserOperation(
                    user=XrayUser(
                        email=user.email,
                        level=0,
                        account=to_typed_message(
                            Account(
                                password=password
                            )
                        )
                    )
                )
            )
        ))
        self.cache.setex(email_hash(user.email), 1800, payload.region)
        return make_config(user.email, password, payload.region)

    def keep(self, user: User):
        if not self.cache.exists(user.email):
            return
        self.cache.expire(user.email, 1800)

    def revoke(self, user: User, region: str = None):
        if not region and not self.cache.exists(email_hash(user.email)):
            return
        if self.cache.exists(email_hash(user.email)):
            region = self.cache.get(email_hash(user.email)).decode()
        self.cache.delete(email_hash(user.email))
        # noinspection PyBroadException
        try:
            client = GrpcClient(region)
            operation = to_typed_message(command.RemoveUserOperation(email=user.email))
            client.handler.AlterInbound(command.AlterInboundRequest(tag="default", operation=operation))
        except Exception:
            pass
