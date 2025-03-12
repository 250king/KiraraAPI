FROM python:alpine

WORKDIR /app

COPY src /app

RUN pip install grpcio\
    grpcio-tools\
    fastapi\
    uvicorn\
    jwcrypto\
    APScheduler\
    pydantic-settings\
    httpx

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--proxy-headers", "--forwarded-allow-ips", "*"]
