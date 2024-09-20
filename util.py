from contextlib import asynccontextmanager
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from fastapi import HTTPException, Request, FastAPI
from datetime import datetime
from jwcrypto.jwk import JWK
from jwcrypto.jwt import JWT
import os
import httpx


client = httpx.AsyncClient(base_url=os.environ["KIRARA_URL"])
key = JWK.from_pem(open("data/public.pem", "rb").read())
scheduler = AsyncIOScheduler()


def make_config(name, token, tunnel):
    return {
        "remarks": name,
        "inbounds": [
            {
                "listen": "127.0.0.1",
                "port": 10808,
                "protocol": "socks",
                "settings": {
                    "auth": "noauth",
                    "udp": True,
                    "userLevel": 8
                },
                "sniffing": {
                    "destOverride": [
                        "http",
                        "tls"
                    ],
                    "enabled": True,
                    "routeOnly": False
                },
                "tag": "socks"
            }
        ],
        "outbounds": [
            {
                "mux": {
                    "concurrency": -1,
                    "enabled": False,
                    "xudpConcurrency": 8,
                    "xudpProxyUDP443": ""
                },
                "protocol": "vless",
                "settings": {
                    "vnext": [
                        {
                            "address": "vpc.sparklefantasia.com",
                            "port": 443,
                            "users": [
                                {
                                    "encryption": "none",
                                    "flow": "",
                                    "id": token,
                                    "level": 8,
                                    "security": "auto"
                                }
                            ]
                        }
                    ]
                },
                "streamSettings": {
                    "network": "ws",
                    "security": "tls",
                    "tlsSettings": {
                        "allowInsecure": False,
                        "alpn": [
                            "h3"
                        ],
                        "fingerprint": "randomized",
                        "publicKey": "",
                        "serverName": "",
                        "shortId": "",
                        "show": False,
                        "spiderX": ""
                    },
                    "wsSettings": {
                        "headers": {
                            "Host": ""
                        },
                        "path": f"/proxy/ws/{tunnel}"
                    }
                },
                "tag": "proxy"
            },
            {
                "protocol": "freedom",
                "settings": {
                    "domainStrategy": "UseIP"
                },
                "tag": "direct"
            }
        ],
        "policy": {
            "levels": {
                "8": {
                    "connIdle": 300,
                    "downlinkOnly": 1,
                    "handshake": 4,
                    "uplinkOnly": 1
                }
            },
            "system": {
                "statsOutboundUplink": False,
                "statsOutboundDownlink": False
            }
        },
        "routing": {
            "domainStrategy": "IPIfNonMatch",
            "rules": [
                {
                    "domain": [
                        "domain:star-api.com",
                        "domain:gstatic.com"
                    ],
                    "outboundTag": "proxy"
                },
                {
                    "ip": [
                        "1.1.1.1"
                    ],
                    "outboundTag": "proxy"
                },
                {
                    "outboundTag": "direct",
                    "port": "0-65535"
                }
            ]
        },
        "dns": {},
        "log": {},
        "stats": {}
    }


@asynccontextmanager
async def lifespan(_: FastAPI):
    scheduler.add_job(refresh_session, "interval", days=1, next_run_time=datetime.now())
    scheduler.start()
    yield
    scheduler.shutdown()


async def refresh_session():
    payload = {
        "username": os.environ["KIRARA_USERNAME"],
        "password": os.environ["KIRARA_PASSWORD"]
    }
    await client.post("/login", data=payload)


async def check_jwt(request: Request):
    headers = request.headers
    if "Authorization" not in headers:
        raise HTTPException(status_code=401)
    try:
        token = request.headers["Authorization"].split(" ")[1]
        return JWT(jwt=token, key=key)
    except Exception:
        raise HTTPException(status_code=401)
