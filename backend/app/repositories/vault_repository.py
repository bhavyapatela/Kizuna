from sqlalchemy.orm import Session
from app.models.vault import Vault
from uuid import UUID

class VaultRepository:
    @staticmethod
    def get_by_id(db: Session, vault_id: UUID, user_id: UUID) -> Vault | None:
        return db.query(Vault).filter(Vault.id == vault_id, Vault.user_id == user_id).first()

    @staticmethod
    def list_by_user(db: Session, user_id: UUID) -> list[Vault]:
        return db.query(Vault).filter(Vault.user_id == user_id).all()

    @staticmethod
    def create(db: Session, user_id: UUID, encrypted_name: str) -> Vault:
        db_vault = Vault(
            user_id=user_id,
            encrypted_name=encrypted_name
        )
        db.add(db_vault)
        db.commit()
        db.refresh(db_vault)
        return db_vault

    @staticmethod
    def update(db: Session, vault_id: UUID, user_id: UUID, encrypted_name: str) -> Vault | None:
        vault = VaultRepository.get_by_id(db, vault_id, user_id)
        if vault:
            vault.encrypted_name = encrypted_name
            db.commit()
            db.refresh(vault)
        return vault

    @staticmethod
    def delete(db: Session, vault_id: UUID, user_id: UUID) -> bool:
        vault = VaultRepository.get_by_id(db, vault_id, user_id)
        if vault:
            db.delete(vault)
            db.commit()
            return True
        return False
