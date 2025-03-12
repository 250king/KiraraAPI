import httpx
from fastapi import HTTPException
from env import Env
from util.api import MicrosoftIntercept


class DownloadService:
    def __init__(self):
        # noinspection PyArgumentList
        self._env = Env()
        self.url = "https://graph.microsoft.com/v1.0/drive/root/children:KiraraFans/"
        self._client = httpx.AsyncClient(event_hooks={
            "request": [MicrosoftIntercept().request]
        })

    async def get_url(self, package: str):
        response = await self._client.get(f"{self.url}{package}.apk")
        if response.status_code != 200:
            raise HTTPException(404, "File not found")
        result = response.json()
        return result["@microsoft.graph.downloadUrl"]
