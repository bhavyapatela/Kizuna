from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_current_user
from app.schemas.vault import CreateVaultPayload, UpdateVaultPayload, VaultOut
from app.services.vault_service import VaultService
from app.models.user import User
from uuid import UUID

router = APIRouter(prefix='/vaults', tags=["Vaults"])

def _format_vault(vault) -> dict:
    # Safely convert time/datetime to ISO formats
    created_str = vault.created_at.isoformat() if vault.created_at else ""
    # updated_at can be time or datetime, format safely
    updated_str = ""
    if vault.updated_at:
        try:
            updated_str = vault.updated_at.isoformat()
        except AttributeError:
            updated_str = str(vault.updated_at)

    return {
        "id": str(vault.id),
        "name": vault.encrypted_name, # returned to client as 'name' (encrypted string)
        "itemCount": len(vault.passwords) if hasattr(vault, "passwords") else 0,
        "createdAt": created_str,
        "updatedAt": updated_str
    }

@router.get("", response_model=list[VaultOut])
def get_vaults(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    vaults = VaultService.list_vaults(db, current_user.id)
    return [_format_vault(v) for v in vaults]

@router.get("/{vault_id}", response_model=VaultOut)
def get_vault(vault_id: UUID, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        vault = VaultService.get_vault(db, vault_id, current_user.id)
        return _format_vault(vault)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

@router.post("", response_model=VaultOut)
def create_vault(payload: CreateVaultPayload, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        # payload.name is the encrypted name sent from client
        vault = VaultService.create_vault(db, current_user.id, payload.name)
        return _format_vault(vault)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.put("/{vault_id}", response_model=VaultOut)
def update_vault(vault_id: UUID, payload: UpdateVaultPayload, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        vault = VaultService.update_vault(db, vault_id, current_user.id, payload.name)
        return _format_vault(vault)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

@router.delete("/{vault_id}")
def delete_vault(vault_id: UUID, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        VaultService.delete_vault(db, vault_id, current_user.id)
        return {"status": "success", "message": "Vault deleted"}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
