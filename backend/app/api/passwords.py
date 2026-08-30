from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_current_user
from app.schemas.password import CreateVaultItemPayload, UpdateVaultItemPayload, VaultItemOut
from app.services.password_service import PasswordService
from app.models.user import User
from uuid import UUID

router = APIRouter(tags=["Items"])

def _format_item(item) -> dict:
    return {
        "id": str(item.id),
        "vaultId": str(item.vault_id),
        "type": "login",  # default type
        "name": item.encrypted_title,
        "username": item.encrypted_username,
        "password": item.encrypted_password,
        "url": item.encrypted_url,
        "notes": item.encrypted_notes,
        "favorite": bool(item.favorite),
        "createdAt": item.created_at.isoformat() if item.created_at else "",
        "updatedAt": item.last_used_at.isoformat() if item.last_used_at else (item.created_at.isoformat() if item.created_at else "")
    }

@router.get("/items", response_model=list[VaultItemOut])
def get_all_items(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    items = PasswordService.list_all_items(db, current_user.id)
    return [_format_item(i) for i in items]

@router.get("/vaults/{vault_id}/items", response_model=list[VaultItemOut])
def get_vault_items(vault_id: UUID, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        items = PasswordService.list_vault_items(db, vault_id, current_user.id)
        return [_format_item(i) for i in items]
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

@router.post("/vaults/{vault_id}/items", response_model=VaultItemOut)
def create_vault_item(vault_id: UUID, payload: CreateVaultItemPayload, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        # Map payload properties to database model names
        db_data = {
            "encrypted_title": payload.name,
            "encrypted_username": payload.username or "",
            "encrypted_password": payload.password or "",
            "encrypted_url": payload.url,
            "encrypted_notes": payload.notes,
            "favorite": payload.favorite
        }
        item = PasswordService.create_item(db, vault_id, current_user.id, db_data)
        return _format_item(item)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.put("/items/{item_id}", response_model=VaultItemOut)
def update_item(item_id: UUID, payload: UpdateVaultItemPayload, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        db_data = {}
        if payload.name is not None:
            db_data["encrypted_title"] = payload.name
        if payload.username is not None:
            db_data["encrypted_username"] = payload.username
        if payload.password is not None:
            db_data["encrypted_password"] = payload.password
        if payload.url is not None:
            db_data["encrypted_url"] = payload.url
        if payload.notes is not None:
            db_data["encrypted_notes"] = payload.notes
        if payload.favorite is not None:
            db_data["favorite"] = payload.favorite

        item = PasswordService.update_item(db, item_id, current_user.id, db_data)
        return _format_item(item)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

@router.delete("/items/{item_id}")
def delete_item(item_id: UUID, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        PasswordService.delete_item(db, item_id, current_user.id)
        return {"status": "success", "message": "Item deleted"}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
