from fastapi import APIRouter, Depends
from app.dependencies import get_current_user
from app.schemas.user import UserSettingsSchema, UpdateSettingsPayload
from app.models.user import User

router = APIRouter(prefix="/settings", tags=["Settings"])

# In-memory store for settings to avoid modifying postgres schema without migration
_user_settings_db = {}

@router.get("", response_model=UserSettingsSchema)
def get_settings(current_user: User = Depends(get_current_user)):
    user_id = str(current_user.id)
    if user_id not in _user_settings_db:
        # Default settings
        _user_settings_db[user_id] = {
            "autoLockMinutes": 15,
            "clipboardClearSeconds": 30,
            "showFavicons": True,
            "compactMode": False
        }
    return _user_settings_db[user_id]

@router.put("", response_model=UserSettingsSchema)
def update_settings(payload: UpdateSettingsPayload, current_user: User = Depends(get_current_user)):
    user_id = str(current_user.id)
    if user_id not in _user_settings_db:
        _user_settings_db[user_id] = {
            "autoLockMinutes": 15,
            "clipboardClearSeconds": 30,
            "showFavicons": True,
            "compactMode": False
        }
    
    settings = _user_settings_db[user_id]
    if payload.autoLockMinutes is not None:
        settings["autoLockMinutes"] = payload.autoLockMinutes
    if payload.clipboardClearSeconds is not None:
        settings["clipboardClearSeconds"] = payload.clipboardClearSeconds
    if payload.showFavicons is not None:
        settings["showFavicons"] = payload.showFavicons
    if payload.compactMode is not None:
        settings["compactMode"] = payload.compactMode
        
    return settings
