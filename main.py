from util import make_config, check_jwt, lifespan, client
from fastapi import FastAPI
from fastapi import HTTPException
from fastapi import Depends
from jwcrypto.jwt import JWT
import oss2
import uuid
import random
import socket
import json
import time


app = FastAPI(lifespan=lifespan)
auth = oss2.ProviderAuth(oss2.credentials.EnvironmentVariableCredentialsProvider())
bucket = oss2.Bucket(auth, "https://s2.250king.top", "250king", True)
files = {
    "com.aniplex.kirarafantasia": "archive/きららファンタジア_3.6.0.apk",
    "com.vmos.pro": "archive/VMOSPro_3.0.7.apk"
}


@app.get("/config")
async def _(jwt: JWT = Depends(check_jwt)):
    user = json.loads(jwt.claims)["sub"]
    users = (await client.post("/xui/inbound/list")).json()
    profile = None
    for i in users["obj"]:
        if i["remark"] == user:
            profile = i
    if profile is None:
        raise HTTPException(status_code=404)
    expire = int(profile["expiryTime"] / 1000)
    if profile["expiryTime"] != 0 and time.time() > expire:
        raise HTTPException(status_code=410)
    if not profile["enable"]:
        raise HTTPException(status_code=403)
    settings = json.loads(profile["settings"])
    steam_settings = json.loads(profile["streamSettings"])
    token = str(uuid.uuid4())
    while True:
        port = random.randint(10000, 65535)
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        try:
            s.bind(("", port))
            s.close()
            break
        except socket.error:
            continue
    settings["clients"][0]["id"] = token
    steam_settings["wsSettings"]["path"] = f"/proxy/ws/{port}"
    profile["port"] = port
    profile["settings"] = json.dumps(settings)
    profile["streamSettings"] = json.dumps(steam_settings)
    await client.post(f"/xui/inbound/update/{profile['id']}", data=profile)
    return make_config(profile["remark"], token, port)


@app.get("/file/{name}", dependencies=[Depends(check_jwt)])
async def _(name: str):
    if name not in files:
        raise HTTPException(status_code=404)
    url = bucket.sign_url("GET", files[name], 600, slash_safe=True)
    return {
        "url": url
    }
