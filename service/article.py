import os
from fastapi import HTTPException


class ArticleService:
    @staticmethod
    def get_content(name: str):
        if not os.path.exists(f"data/article/{name}.md"):
            raise HTTPException(404)
        file = open(f"data/article/{name}.md", "rb")
        content = file.read()
        file.close()
        return content
