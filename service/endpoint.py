from env import Env

class EndpointService:
    def __init__(self):
        # noinspection PyArgumentList
        self.env = Env()

    def list_endpoints(self):
        return self.env.endpoints
