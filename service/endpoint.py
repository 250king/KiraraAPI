from env import Env

class EndpointService:
    def __init__(self):
        # noinspection PyArgumentList
        self._env = Env()

    def list_endpoints(self):
        return self._env.endpoints
