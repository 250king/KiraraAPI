from fastapi import APIRouter, Request
from starlette.authentication import requires
from model.data.init import InitOperation
from service.session import SessionService

router = APIRouter()
proxy_service = SessionService()


@router.post("/session")
@requires(["Kirara玩家"])
async def init_proxy(request: Request, payload: InitOperation):
    config = proxy_service.init(request.user, payload)
    return config


@router.delete("/session", status_code=204)
@requires(["Kirara玩家"])
async def revoke_session(request: Request):
    proxy_service.revoke(request.user)
