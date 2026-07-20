import uuid
from fastapi import APIRouter, Depends, Request
from models import ChatIn, ChatMessage
from utils.security import get_current_user
from services.rag import retrieve, answer_with_context

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("")
async def chat(payload: ChatIn, request: Request, uid: str = Depends(get_current_user)):
    db = request.app.state.db
    session_id = payload.session_id or str(uuid.uuid4())

    # persist user message
    user_msg = ChatMessage(user_id=uid, session_id=session_id, role="user", content=payload.message)
    await db.chat_messages.insert_one(user_msg.model_dump())

    contexts = await retrieve(db, uid, payload.message, top_k=6)
    answer = await answer_with_context(session_id, payload.message, contexts)

    sources = [
        {
            "document_id": c["document_id"],
            "chunk_id": c["chunk_id"],
            "score": round(c["score"], 3),
            "snippet": c["text"][:220],
        }
        for c in contexts
    ]
    asst_msg = ChatMessage(
        user_id=uid, session_id=session_id, role="assistant", content=answer, sources=sources,
    )
    await db.chat_messages.insert_one(asst_msg.model_dump())
    return {"session_id": session_id, "answer": answer, "sources": sources}


@router.get("/sessions")
async def sessions(request: Request, uid: str = Depends(get_current_user)):
    db = request.app.state.db
    pipeline = [
        {"$match": {"user_id": uid}},
        {"$sort": {"created_at": -1}},
        {"$group": {
            "_id": "$session_id",
            "last_at": {"$first": "$created_at"},
            "last_content": {"$first": "$content"},
            "count": {"$sum": 1},
        }},
        {"$sort": {"last_at": -1}},
        {"$limit": 50},
    ]
    out = []
    async for row in db.chat_messages.aggregate(pipeline):
        out.append({
            "session_id": row["_id"],
            "last_at": row["last_at"],
            "preview": row["last_content"][:80],
            "messages": row["count"],
        })
    return out


@router.get("/{session_id}")
async def get_history(session_id: str, request: Request, uid: str = Depends(get_current_user)):
    db = request.app.state.db
    msgs = await db.chat_messages.find(
        {"user_id": uid, "session_id": session_id}, {"_id": 0}
    ).sort("created_at", 1).to_list(1000)
    return msgs
