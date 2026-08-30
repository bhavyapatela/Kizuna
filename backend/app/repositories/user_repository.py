from sqlalchemy.orm import Session
from app.models.user import User
from uuid import UUID

class UserRepository:
    @staticmethod
    def get_by_id(db: Session, user_id: UUID) -> User | None:
        return db.query(User).filter(User.id == user_id).first()

    @staticmethod
    def get_by_email(db: Session, email: str) -> User | None:
        return db.query(User).filter(User.email == email.lower()).first()

    @staticmethod
    def create(db: Session, email: str, master_password_hash: str) -> User:
        db_user = User(
            email=email.lower(),
            master_password_hash=master_password_hash
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
