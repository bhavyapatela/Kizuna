from pydantic import BaseModel

class UserSettingsSchema(BaseModel):
    autoLockMinutes: int = 15
    clipboardClearSeconds: int = 30
    showFavicons: bool = True
    compactMode: bool = False

class UpdateSettingsPayload(BaseModel):
    autoLockMinutes: int | None = None
    clipboardClearSeconds: int | None = None
    showFavicons: bool | None = None
    compactMode: bool | None = None
