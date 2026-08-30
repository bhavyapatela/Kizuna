from sqlalchemy.orm import Session
from app.repositories.password_repository import PasswordRepository
from app.repositories.vault_repository import VaultRepository
from app.models.password import Password
from uuid import UUID

class PasswordService:
    @staticmethod
    def get_item(db: Session, item_id: UUID, user_id: UUID) -> Password:
        item = PasswordRepository.get_by_id(db, item_id, user_id)
        if not item:
            raise ValueError("Item not found")
        return item

    @staticmethod
    def list_all_items(db: Session, user_id: UUID) -> list[Password]:
        return PasswordRepository.list_all_by_user(db, user_id)

    @staticmethod
    def list_vault_items(db: Session, vault_id: UUID, user_id: UUID) -> list[Password]:
        # Validate vault access
        vault = VaultRepository.get_by_id(db, vault_id, user_id)
        if not vault:
            raise ValueError("Vault not found")
        return PasswordRepository.list_by_vault(db, vault_id, user_id)

    @staticmethod
    def create_item(db: Session, vault_id: UUID, user_id: UUID, data: dict) -> Password:
        # Check vault ownership
        vault = VaultRepository.get_by_id(db, vault_id, user_id)
        if not vault:
            raise ValueError("Vault not found")
            
        return PasswordRepository.create(db, vault_id, data)

    @staticmethod
    def update_item(db: Session, item_id: UUID, user_id: UUID, data: dict) -> Password:
        item = PasswordRepository.get_by_id(db, item_id, user_id)
        if not item:
            raise ValueError("Item not found")
            
        return PasswordRepository.update(db, item, data)

    @staticmethod
    def delete_item(db: Session, item_id: UUID, user_id: UUID) -> None:
        item = PasswordRepository.get_by_id(db, item_id, user_id)
        if not item:
            raise ValueError("Item not found")
            
        PasswordRepository.delete(db, item)
