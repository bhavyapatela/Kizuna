from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_current_user
from app.schemas.auth import RegisterRequest, LoginRequest, AuthResponse, UserOut
from app.services.auth_service import AuthService
from app.security.rate_limit import rate_limiter
from app.models.user import User

router = APIRouter(prefix='/auth', tags=["Authentication"])

@router.post("/register", response_model=AuthResponse, dependencies=[Depends(rate_limiter(limit=3, window_seconds=60))])
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    try:
        res = AuthService.register(db, payload.email, payload.password)
        return {
            "user": res["user"],
            "accessToken": res["access_token"]
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/login", response_model=AuthResponse, dependencies=[Depends(rate_limiter(limit=5, window_seconds=60))])
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    try:
        res = AuthService.login(db, payload.email, payload.password)
        return {
            "user": res["user"],
            "accessToken": res["access_token"]
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )

@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "name": current_user.name,
        "created_at": current_user.created_at.isoformat() if current_user.created_at else None
    }

@router.post("/logout")
def logout(current_user: User = Depends(get_current_user)):
    return {"message": "Successfully logged out"}