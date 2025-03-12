import grpc
import base64
import time
import util.xray.app.proxyman.command.command_pb2_grpc as s
from util.xray.common.serial.typed_message_pb2 import TypedMessage
from google.protobuf.message import Message
from httpx import AsyncClient, Request
from env import Env


def to_typed_message(message: Message) -> TypedMessage:
    if message is None:
        return None
    serialized_value = message.SerializeToString()
    message_type = message.DESCRIPTOR.full_name
    return TypedMessage(type=message_type, value=serialized_value)


class GrpcClient:
    def __init__(self, region: str):
        channel = grpc.secure_channel(f"{region}.api.kirafan.xyz", grpc.ssl_channel_credentials(
            private_key=open("data/key.pem", "rb").read(),
            certificate_chain=open("data/client.pem", "rb").read()
        ))
        self.handler = s.HandlerServiceStub(channel)


class MicrosoftIntercept:
    def __init__(self):
        self._token = None
        self._expires = None
        # noinspection PyArgumentList
        self._config = Env()
        self._client = AsyncClient()

    async def request(self, request: Request):
        if self._expires is None or self._expires <= int(time.time()):
            credential = base64.b64encode(f"{self._config.client_id}:{self._config.client_secret}".encode())
            headers = {
                "Authorization": f"Basic {credential.decode()}"
            }
            data = {
                "grant_type": "client_credentials",
                "scope": "https://graph.microsoft.com/.default"
            }
            url = "https://login.microsoftonline.com/4a15d947-a261-4863-acae-73a5b1ee5f24/oauth2/v2.0/token"
            response = await self._client.post(url, headers=headers, data=data)
            if response.status_code != 200:
                raise Exception(response.text)
            result = response.json()
            self._token = result["access_token"]
            self._expires = int(time.time()) + result["expires_in"]
        request.headers["Authorization"] = f"Bearer {self._token}"
