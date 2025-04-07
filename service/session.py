import secrets
import redis
from fastapi import HTTPException
import util.xray.app.proxyman.command.command_pb2 as command
from env import Env
from model.data.init import InitOperation
from model.data.user import User
from util.api import to_typed_message, GrpcClient
from util.config import make_config
from util.string import email_encode
from util.xray.common.protocol.user_pb2 import User as XrayUser
from util.xray.proxy.trojan.config_pb2 import Account


# noinspection PyUnusedLocal, PyArgumentList, PyBroadException, PyUnresolvedReferences
class SessionService:
    def __init__(self):
        self.env = Env()
        self.cache = redis.Redis(self.env.redis_host, decode_responses=True)

    # noinspection
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
        self.cache.set(email_encode(user.email), payload.region)
        return make_config(user.email, password, payload.region)

    def revoke(self, user: User, region: str = None):
        if not region and not self.cache.exists(email_encode(user.email)):
            return
        if self.cache.exists(email_encode(user.email)) and region is None:
            region = self.cache.get(email_encode(user.email))
            self.cache.delete(email_encode(user.email))
        try:
            client = GrpcClient(region)
            operation = to_typed_message(command.RemoveUserOperation(email=user.email))
            client.handler.AlterInbound(command.AlterInboundRequest(tag="default", operation=operation))
        except Exception:
            pass
