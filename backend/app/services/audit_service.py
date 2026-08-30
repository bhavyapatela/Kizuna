from sqlalchemy.orm import Session
from app.models.audit_log import AuditLog
from uuid import UUID

class AuditService:
    @staticmethod
    def log_action(
        db: Session,
        user_id: UUID,
        action: str,
        resource_type: str = None,
        resource_id: UUID = None,
        success: bool = True,
        metadata: dict = None,
        ip_address: str = None,
        user_agent: str = None
    ) -> AuditLog:
        log = AuditLog(
            user_id=user_id,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            success=success,
            metadata=metadata,
            ip_address=ip_address,
            user_agent=user_agent
        )
        db.add(log)
        db.commit()
        db.refresh(log)
        return log
