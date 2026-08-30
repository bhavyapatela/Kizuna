from sqlalchemy.orm import Session
from app.repositories.user_repository import UserRepository
from app.repositories.vault_repository import VaultRepository
from app.repositories.token_repository import RefreshTokenRepository
from app.security.hashing import get_password_hash, verify_password
from app.security.jwt import create_access_token
from app.config import settings
from datetime import datetime, timedelta, timezone
import uuid

class AuthService:
    @staticmethod
    def _apply_pepper(password_hash: str) -> str:
        """
        Combine the client-side master_password_hash with the server secret Pepper.
        """
        return f"{password_hash}:{settings.PEPPER}"

    @staticmethod
    def register(db: Session, email: str, master_password_hash: str) -> dict:
        # Check if user already exists
        existing = UserRepository.get_by_email(db, email)
        if existing:
            raise ValueError("Email already registered")

        # Double Hash: hash client's hash + Pepper
        peppered_hash = AuthService._apply_pepper(master_password_hash)
        db_hash = get_password_hash(peppered_hash)

        # Create user
        user = UserRepository.create(db, email, db_hash)

        # Create default vault (encrypted with a placeholder client-provided representation,
        # but since we are zero-knowledge, the client will send the default vault payload later
        # or we create a blind placeholder vault now. Let's create a default "Personal" vault
        # but since vault name is encrypted, we store a blind ciphertext. Let's let the client
        # create the default vault on registration, or we can just initialize an empty vault).
        # We will let the user's client create vaults via the API vaults endpoint.

        # Generate tokens
        access_token = create_access_token({"sub": str(user.id)})
        
        return {
            "user": {
                "id": str(user.id),
                "email": user.email,
                "name": user.name,
                "created_at": user.created_at.isoformat() if user.created_at else None
            },
            "access_token": access_token
        }

    @staticmethod
    def login(db: Session, email: str, master_password_hash: str) -> dict:
        user = UserRepository.get_by_email(db, email)
        if not user:
            raise ValueError("Invalid email or password")

        # Verify hash + Pepper
        peppered_hash = AuthService._apply_pepper(master_password_hash)
        if not verify_password(peppered_hash, user.master_password_hash):
            raise ValueError("Invalid email or password")

        # Generate tokens
        access_token = create_access_token({"sub": str(user.id)})

        return {
            "user": {
                "id": str(user.id),
                "email": user.email,
                "name": user.name,
                "created_at": user.created_at.isoformat() if user.created_at else None
            },
            "access_token": access_token
        }
