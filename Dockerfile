FROM python:alpine

WORKDIR /app

RUN pip install --no-cache-dir grpcio\
    grpcio-tools\
    fastapi\
    uvicorn\
    jwcrypto\
    pydantic-settings\
    httpx\
    redis

COPY . /app

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--proxy-headers", "--forwarded-allow-ips", "*"]
