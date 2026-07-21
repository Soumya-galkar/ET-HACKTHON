from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, EmailStr, ConfigDict
import uuid


def _uid() -> str:
    return str(uuid.uuid4())


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


class BaseDoc(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=_uid)
    created_at: str = Field(default_factory=_now)


# ============ Users ============
class User(BaseDoc):
    email: EmailStr
    name: str
    password_hash: str
    role: str = "engineer"


class UserPublic(BaseModel):
    id: str
    email: EmailStr
    name: str
    role: str
    created_at: str


class SignupIn(BaseModel):
    email: EmailStr
    name: str
    password: str


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    token: str
    user: UserPublic


# ============ Documents ============
class Document(BaseDoc):
    user_id: str
    filename: str
    file_type: str
    size: int
    storage_path: str
    status: str = "processing"  # processing, ready, failed
    error: Optional[str] = None
    page_count: int = 0
    chunk_count: int = 0
    entity_count: int = 0
    metadata: Dict[str, Any] = Field(default_factory=dict)


class DocumentPublic(BaseModel):
    id: str
    filename: str
    file_type: str
    size: int
    status: str
    error: Optional[str] = None
    page_count: int
    chunk_count: int
    entity_count: int
    created_at: str
    metadata: Dict[str, Any] = {}


# ============ Chunks (text + embedding) ============
class Chunk(BaseDoc):
    user_id: str
    document_id: str
    index: int
    text: str
    embedding: List[float] = Field(default_factory=list)
    page: Optional[int] = None


# ============ Entities ============
class Entity(BaseDoc):
    user_id: str
    document_id: str
    label: str          # canonical name
    type: str           # Equipment, WorkOrder, Department, ...
    description: str = ""
    mentions: int = 1


class Relationship(BaseDoc):
    user_id: str
    document_id: Optional[str] = None
    source_id: str
    target_id: str
    label: str  # "operates", "assigned_to", "caused_by", ...


# ============ Chat ============
class ChatMessage(BaseDoc):
    user_id: str
    session_id: str
    role: str  # user | assistant
    content: str
    sources: List[Dict[str, Any]] = Field(default_factory=list)


class ChatIn(BaseModel):
    session_id: Optional[str] = None
    message: str


# ============ Search ============
class SearchIn(BaseModel):
    query: str
    top_k: int = 6


# ============ Work Orders ============
class WorkOrder(BaseDoc):
    user_id: str
    title: str
    equipment: Optional[str] = None
    status: str = "open"  # open, in_progress, closed
    priority: str = "medium"
    description: str = ""


class WorkOrderIn(BaseModel):
    title: str
    equipment: Optional[str] = None
    status: str = "open"
    priority: str = "medium"
    description: str = ""


class WorkOrderUpdate(BaseModel):
    title: Optional[str] = None
    equipment: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    description: Optional[str] = None


# ============ Maintenance Report ============
class MaintenanceReport(BaseDoc):
    user_id: str
    equipment: str
    failure_summary: str
    root_cause: str
    risk_level: str
    recommended_actions: List[str]
    preventive_maintenance: List[str]
    predictive_maintenance: List[str]
    required_parts: List[str]
    required_skills: List[str]
    estimated_downtime: str
    sources: List[Dict[str, Any]] = Field(default_factory=list)


class MaintenanceRequest(BaseModel):
    equipment: str
    context: Optional[str] = None