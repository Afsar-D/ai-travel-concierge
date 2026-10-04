from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from app.database.models import User
from app.database.session import get_session
from app.config.security import hash_password, verify_password, create_access_token
from app.schema.auth import (
    TokenResponse,
    UserResponse,
    UserLoginRequest,
    UserRegisterRequest,
)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post(
    "/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED
)
async def register(
    payload: UserRegisterRequest, session: AsyncSession = Depends(get_session)
):
    statement = select(User).where(User.email == payload.email)
    sess = await session.exec(statement=statement)
    if sess.first():
        raise HTTPException(status_code=400, detail="Email already registered")
    else:
        hashed_password = hash_password(payload.password)
        new_user = User(
            name=payload.name, email=payload.email, hashed_password=hashed_password
        )
        session.add(new_user)
        await session.commit()
        await session.refresh(new_user)
        token = create_access_token(data={"sub": new_user.email})
        return TokenResponse(
            access_token=token,
            token_type="bearer",
            user=UserResponse(id=new_user.id, name=new_user.name, email=new_user.email),
        )


@router.post("/login", response_model=TokenResponse)
async def login(
    payload: UserLoginRequest, session: AsyncSession = Depends(get_session)
):
    statement = select(User).where(User.email == payload.email)
    sess = await session.exec(statement)
    user = sess.first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    else:
        token = create_access_token(data={"sub": user.email})
        return TokenResponse(
            access_token=token,
            token_type="bearer",
            user=UserResponse(id=user.id, name=user.name, email=user.email),
        )
