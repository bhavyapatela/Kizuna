from sqlalchemy.orm import Session
from app.repositories.vault_repository import VaultRepository
from app.models.vault import Vault
from uuid import UUID

class VaultService:
    @staticmethod
    def get_vault(db: Session, vault_id: UUID, user_id: UUID) -> Vault:
        vault = VaultRepository.get_by_id(db, vault_id, user_id)
        if not vault:
            raise ValueError("Vault not found")
        return vault

    @staticmethod
    def list_vaults(db: Session, user_id: UUID) -> list[Vault]:
        return VaultRepository.list_by_user(db, user_id)

    @staticmethod
    def create_vault(db: Session, user_id: UUID, encrypted_name: str) -> Vault:
        if not encrypted_name:
            raise ValueError("Vault name is required")
        return VaultRepository.create(db, user_id, encrypted_name)

    @staticmethod
    def update_vault(db: Session, vault_id: UUID, user_id: UUID, encrypted_name: str) -> Vault:
        vault = VaultRepository.update(db, vault_id, user_id, encrypted_name)
        if not vault:
            raise ValueError("Vault not found")
        return vault

    @staticmethod
    def delete_vault(db: Session, vault_id: UUID, user_id: UUID) -> None:
        deleted = VaultRepository.delete(db, vault_id, user_id)
        if not deleted:
            raise ValueError("Vault not found")
