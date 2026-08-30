from pydantic import BaseModel, ConfigDict
from datetime import datetime, time

class CreateVaultPayload(BaseModel):
    name: str  # maps to encrypted_name
    description: str | None = None
    icon: str | None = None

class UpdateVaultPayload(BaseModel):
    name: str | None = None

class VaultOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str  # maps from encrypted_name
    itemCount: int = 0
    createdAt: str
    updatedAt: str
