from fastapi import APIRouter, HTTPException, Depends, Request
from models import SignupIn, LoginIn, AuthResponse, User, UserPublic
from utils.security import hash_password, verify_password, create_token, get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])


def _public(u: dict) -> dict:
    return {
        "id": u["id"],
        "email": u["email"],
        "name": u["name"],
        "role": u.get("role", "engineer"),
        "created_at": u["created_at"],
    }


@router.post("/signup", response_model=AuthResponse)
async def signup(payload: SignupIn, request: Request):
    db = request.app.state.db
    existing = await db.users.find_one({"email": payload.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        email=payload.email, name=payload.name,
        password_hash=hash_password(payload.password),
    )
    await db.users.insert_one(user.model_dump())
    return {"token": create_token(user.id), "user": _public(user.model_dump())}


@router.post("/login", response_model=AuthResponse)
async def login(payload: LoginIn, request: Request):
    db = request.app.state.db
    u = await db.users.find_one({"email": payload.email}, {"_id": 0})
    if not u or not verify_password(payload.password, u["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"token": create_token(u["id"]), "user": _public(u)}


@router.get("/me", response_model=UserPublic)
async def me(request: Request, uid: str = Depends(get_current_user)):
    db = request.app.state.db
    u = await db.users.find_one({"id": uid}, {"_id": 0})
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
    return _public(u)
