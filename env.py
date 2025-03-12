from pydantic_settings import BaseSettings
from model.data.endpoint import Endpoint


class Env(BaseSettings):
    client_id: str
    client_secret: str
    endpoints: list[Endpoint]
    redis_host: str
