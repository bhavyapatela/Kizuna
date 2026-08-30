from sqlalchemy.orm import Session
from app.models.device import Device
from uuid import UUID

class DeviceService:
    @staticmethod
    def get_devices(db: Session, user_id: UUID) -> list[Device]:
        return db.query(Device).filter(Device.user_id == user_id).all()

    @staticmethod
    def register_device(db: Session, user_id: UUID, details: dict) -> Device:
        device = Device(
            user_id=user_id,
            device_name=details.get("device_name"),
            browser=details.get("browser"),
            operating_system=details.get("operating_system"),
            user_agent=details.get("user_agent"),
            ip_address=details.get("ip_address"),
            trusted=details.get("trusted", False)
        )
        db.add(device)
        db.commit()
        db.refresh(device)
        return device
