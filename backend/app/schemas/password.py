from pydantic import BaseModel
from typing import Dict, Any

class CreateVaultItemPayload(BaseModel):
    vaultId: str
    type: str = "login"
    name: str  # maps to encrypted_title
    username: str | None = None  # maps to encrypted_username
    password: str | None = None  # maps to encrypted_password
    url: str | None = None  # maps to encrypted_url
    notes: str | None = None  # maps to encrypted_notes
    favorite: bool = False

class UpdateVaultItemPayload(BaseModel):
    name: str | None = None
    username: str | None = None
    password: str | None = None
    url: str | None = None
    notes: str | None = None
    favorite: bool | None = None

class VaultItemOut(BaseModel):
    id: str
    vaultId: str
    type: str
    name: str
    username: str | None = None
    password: str | None = None
    url: str | None = None
    notes: str | None = None
    favorite: bool
    createdAt: str
    updatedAt: str
