from fastapi import APIRouter
from fastapi.responses import RedirectResponse
from service.download import DownloadService

router = APIRouter()
download_service = DownloadService()


@router.get("/download/{package}")
async def download(package: str):
    return RedirectResponse(await download_service.get_url(package), 302)
