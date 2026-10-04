from datetime import datetime, timedelta, timezone
from jose import jwt
import bcrypt

SECRET_KEY = "khul_ja_sim_sim"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440


def hash_password(password: str) -> str:
    pass_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt()
    hashed_pass = bcrypt.hashpw(pass_bytes, salt)
    return hashed_pass.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(
        password=plain_password.encode("utf-8"),
        hashed_password=hashed_password.encode("utf-8"),
    )


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
        to_encode["exp"] = expire
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=ACCESS_TOKEN_EXPIRE_MINUTES
        )
        to_encode["exp"] = expire
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
