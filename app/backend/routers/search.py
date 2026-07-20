from fastapi import APIRouter, Depends, Request
from models import SearchIn
from utils.security import get_current_user
from services.rag import retrieve

router = APIRouter(prefix="/search", tags=["search"])


@router.post("")
async def search(payload: SearchIn, request: Request, uid: str = Depends(get_current_user)):
    db = request.app.state.db
    results = await retrieve(db, uid, payload.query, top_k=payload.top_k)
    # enrich with document filename
    out = []
    doc_cache = {}
    for r in results:
        did = r["document_id"]
        if did not in doc_cache:
            d = await db.documents.find_one({"id": did, "user_id": uid}, {"_id": 0, "filename": 1, "id": 1})
            doc_cache[did] = d or {"filename": "(deleted)"}
        out.append({**r, "document_filename": doc_cache[did]["filename"]})
    return {"query": payload.query, "results": out}
