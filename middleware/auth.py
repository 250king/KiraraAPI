import json
from jwcrypto.jwk import JWK
from jwcrypto.jwt import JWT
from starlette.authentication import AuthenticationBackend, AuthCredentials
from model.data.user import User


class AuthMiddleware(AuthenticationBackend):
    key = JWK.from_pem(open("data/public.pem", "rb").read())

    claims = {
        "iss": "https://account.250king.top/application/o/kirarafans/",
        "aud": "wimwBO8uyk6DODegsIbdMMtm88baBwYqZkyyOVPO",
        "exp": None,
    }

    # noinspection PyBroadException
    async def authenticate(self, request):
        if "Authorization" not in request.headers:
            return None
        value = request.headers["Authorization"]
        try:
            scheme, credentials = value.split()
            if scheme.lower() != "bearer":
                return None
            jwt = JWT(check_claims=self.claims, key=self.key, jwt=credentials)
        except Exception:
            return None
        data = User.model_validate(json.loads(jwt.claims))
        groups = json.loads(jwt.claims)["groups"]
        groups.append("authenticated")
        return AuthCredentials(groups), data
