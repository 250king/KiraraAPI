import httpx
from fastapi import HTTPException
from env import Env
from util.api import MicrosoftIntercept


class DownloadService:
    def __init__(self):
        # noinspection PyArgumentList
        self._env = Env()
        self._url = f"https://graph.microsoft.com/v1.0/drive/items/{self._env.folder_id}:/"
        self._client = httpx.AsyncClient(event_hooks={
            "request": [MicrosoftIntercept().request]
        })

    async def get_url(self, package: str):
        response = await self._client.get(f"{self._url}{package}.apk")
        if response.status_code != 200:
            raise HTTPException(404)
        result = response.json()
        return result["@microsoft.graph.downloadUrl"]
