from fastapi import APIRouter

router = APIRouter(prefix="/devices", tags=["Devices"])

@router.get("")
def list_devices():
    return []
