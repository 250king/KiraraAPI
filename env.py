from pydantic_settings import BaseSettings
from model.data.endpoint import Endpoint


class Env(BaseSettings):
    folder_id: str
    client_id: str
    client_secret: str
    endpoints: list[Endpoint]
    redis_host: str
