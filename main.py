import importlib
import os
import sys
from fastapi import FastAPI
from starlette.middleware.authentication import AuthenticationMiddleware
from middleware.auth import AuthMiddleware
sys.path.append(os.path.abspath("util/xray"))


app = FastAPI(docs_url=None, redoc_url=None, openapi_url=None)

app.add_middleware(AuthenticationMiddleware, backend=AuthMiddleware())

for i in os.listdir("controller"):
    if i.endswith(".py"):
        app.include_router(importlib.import_module(f"controller.{i.split('.')[0]}").router)
