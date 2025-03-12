from fastapi import APIRouter, Request
from starlette.authentication import requires
from service.endpoint import EndpointService

router = APIRouter()
endpoint_service = EndpointService()


# noinspection PyUnusedLocal
@router.get("/endpoint")
@requires(["Kirara玩家"])
def get_endpoints(request: Request):
    return endpoint_service.list_endpoints()
