from sqlalchemy.orm import Session
from app.models.password import Password
from app.models.vault import Vault
from uuid import UUID
from datetime import datetime, timezone

class PasswordRepository:
    @staticmethod
    def get_by_id(db: Session, item_id: UUID, user_id: UUID) -> Password | None:
        return db.query(Password).join(Vault).filter(
            Password.id == item_id,
            Vault.user_id == user_id
        ).first()

    @staticmethod
    def list_by_vault(db: Session, vault_id: UUID, user_id: UUID) -> list[Password]:
        return db.query(Password).join(Vault).filter(
            Password.vault_id == vault_id,
            Vault.user_id == user_id
        ).all()

    @staticmethod
    def list_all_by_user(db: Session, user_id: UUID) -> list[Password]:
        return db.query(Password).join(Vault).filter(
            Vault.user_id == user_id
        ).all()

    @staticmethod
    def create(db: Session, vault_id: UUID, data: dict) -> Password:
        db_item = Password(
            vault_id=vault_id,
            encrypted_title=data["encrypted_title"],
            encrypted_username=data["encrypted_username"],
            encrypted_password=data["encrypted_password"],
            encrypted_url=data.get("encrypted_url"),
            encrypted_notes=data.get("encrypted_notes"),
            encrypted_totp_secret=data.get("encrypted_totp_secret"),
            encrypted_custom_fields=data.get("encrypted_custom_fields"),
            favorite=data.get("favorite", False)
        )
        db.add(db_item)
        db.commit()
        db.refresh(db_item)
        return db_item

    @staticmethod
    def update(db: Session, item: Password, data: dict) -> Password:
        for key, val in data.items():
            if hasattr(item, key):
                setattr(item, key, val)
        db.commit()
        db.refresh(item)
        return item

    @staticmethod
    def delete(db: Session, item: Password) -> None:
        db.delete(item)
        db.commit()
