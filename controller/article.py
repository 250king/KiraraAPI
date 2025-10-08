from fastapi import APIRouter, Response, Request
from starlette.authentication import requires
from service.article import ArticleService

router = APIRouter()
article_service = ArticleService()


# noinspection PyUnusedLocal
@router.get("/article/{name}")
async def get_article(request: Request, name: str):
    return Response(
        content=article_service.get_content(name),
        media_type="text/markdown"
    )
