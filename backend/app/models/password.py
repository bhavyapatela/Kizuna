from sqlalchemy import Column, String, Text, DateTime, Boolean, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID, JSONB
import uuid
from app.database import Base

class Password(Base):
    __tablename__ = "passwords"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    vault_id = Column(UUID(as_uuid=True), ForeignKey("vaults.id", ondelete="CASCADE"), nullable=False)
    encrypted_title = Column(Text, nullable=False)
    encrypted_username = Column(Text, nullable=False)
    encrypted_password = Column(Text, nullable=False)
    encrypted_url = Column(Text, nullable=True)
    encrypted_notes = Column(Text, nullable=True)
    encrypted_totp_secret = Column(Text, nullable=True)
    encrypted_custom_fields = Column(JSONB, nullable=True)
    favorite = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_used_at = Column(DateTime(timezone=True), nullable=True)
