import base64


def email_encode(email: str) -> str:
    return base64.b64encode(email.encode()).decode()
