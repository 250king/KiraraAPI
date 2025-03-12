import hashlib


def email_hash(email: str) -> str:
    return hashlib.md5(email.encode()).hexdigest()
