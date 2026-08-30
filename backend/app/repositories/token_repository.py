from sqlalchemy.orm import Session
from app.models.refresh_token import RefreshToken
from uuid import UUID
from datetime import datetime

class RefreshTokenRepository:
    @staticmethod
    def create(db: Session, user_id: UUID, token_hash: str, expires_at: datetime) -> RefreshToken:
        db_token = RefreshToken(
            user_id=user_id,
            token_hash=token_hash,
            expires_at=expires_at,
            revoked=False
        )
        db.add(db_token)
        db.commit()
        db.refresh(db_token)
        return db_token

    @staticmethod
    def get_by_hash(db: Session, token_hash: str) -> RefreshToken | None:
        return db.query(RefreshToken).filter(
            RefreshToken.token_hash == token_hash,
            RefreshToken.revoked == False
        ).first()

    @staticmethod
    def revoke(db: Session, token: RefreshToken) -> RefreshToken:
        token.revoked = True
        db.commit()
        db.refresh(token)
        return token

    @staticmethod
    def revoke_all_for_user(db: Session, user_id: UUID) -> None:
        db.query(RefreshToken).filter(
            RefreshToken.user_id == user_id,
            RefreshToken.revoked == False
        ).update({"revoked": True})
        db.commit()
