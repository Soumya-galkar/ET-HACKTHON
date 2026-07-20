import os
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Request, BackgroundTasks

from models import Document, DocumentPublic
from utils.security import get_current_user
from services.pipeline import process_document

router = APIRouter(prefix="/documents", tags=["documents"])

UPLOAD_DIR = Path(os.environ.get("UPLOAD_DIR", "/app/backend/uploads"))
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED = {"pdf", "docx", "txt", "xlsx", "png", "jpg", "jpeg", "webp", "bmp", "tif", "tiff"}


def _public(d: dict) -> dict:
    return {
        "id": d["id"],
        "filename": d["filename"],
        "file_type": d["file_type"],
        "size": d["size"],
        "status": d["status"],
        "error": d.get("error"),
        "page_count": d.get("page_count", 0),
        "chunk_count": d.get("chunk_count", 0),
        "entity_count": d.get("entity_count", 0),
        "created_at": d["created_at"],
        "metadata": d.get("metadata", {}),
    }


@router.post("/upload", response_model=DocumentPublic)
async def upload(
    request: Request,
    background: BackgroundTasks,
    file: UploadFile = File(...),
    uid: str = Depends(get_current_user),
):
    db = request.app.state.db
    ext = Path(file.filename).suffix.lower().lstrip(".")
    if ext not in ALLOWED:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {ext}")

    doc = Document(
        user_id=uid, filename=file.filename, file_type=ext,
        size=0, storage_path="",
    )
    dest = UPLOAD_DIR / f"{doc.id}.{ext}"
    content = await file.read()
    dest.write_bytes(content)
    doc.size = len(content)
    doc.storage_path = str(dest)

    await db.documents.insert_one(doc.model_dump())
    background.add_task(process_document, db, uid, doc.id, str(dest), ext)
    return _public(doc.model_dump())


@router.get("", response_model=list[DocumentPublic])
async def list_docs(request: Request, uid: str = Depends(get_current_user)):
    db = request.app.state.db
    cursor = db.documents.find({"user_id": uid}, {"_id": 0}).sort("created_at", -1)
    docs = await cursor.to_list(500)
    return [_public(d) for d in docs]


@router.get("/{doc_id}")
async def get_doc(doc_id: str, request: Request, uid: str = Depends(get_current_user)):
    db = request.app.state.db
    d = await db.documents.find_one({"id": doc_id, "user_id": uid}, {"_id": 0})
    if not d:
        raise HTTPException(404, "Document not found")

    chunks = await db.chunks.find(
        {"document_id": doc_id, "user_id": uid}, {"_id": 0, "embedding": 0}
    ).sort("index", 1).to_list(2000)
    entities = await db.entities.find(
        {"document_id": doc_id, "user_id": uid}, {"_id": 0}
    ).to_list(500)
    # related docs by shared entity labels
    related = []
    if entities:
        labels = list({e["label"] for e in entities})
        cursor = db.entities.find(
            {"user_id": uid, "label": {"$in": labels}, "document_id": {"$ne": doc_id}},
            {"_id": 0},
        )
        related_docs = {}
        async for e in cursor:
            related_docs.setdefault(e["document_id"], set()).add(e["label"])
        for did, shared in related_docs.items():
            rd = await db.documents.find_one({"id": did, "user_id": uid}, {"_id": 0})
            if rd:
                related.append({
                    "id": rd["id"], "filename": rd["filename"],
                    "shared_entities": list(shared)[:5],
                })
        related.sort(key=lambda x: -len(x["shared_entities"]))
        related = related[:10]

    text = "\n\n".join(c["text"] for c in chunks)
    return {
        "document": _public(d),
        "text": text,
        "chunks": chunks,
        "entities": entities,
        "related": related,
    }


@router.delete("/{doc_id}")
async def delete_doc(doc_id: str, request: Request, uid: str = Depends(get_current_user)):
    db = request.app.state.db
    d = await db.documents.find_one({"id": doc_id, "user_id": uid})
    if not d:
        raise HTTPException(404, "Document not found")
    await db.documents.delete_one({"id": doc_id, "user_id": uid})
    await db.chunks.delete_many({"document_id": doc_id, "user_id": uid})
    await db.entities.delete_many({"document_id": doc_id, "user_id": uid})
    await db.relationships.delete_many({"document_id": doc_id, "user_id": uid})
    try:
        Path(d["storage_path"]).unlink(missing_ok=True)
    except Exception:
        pass
    return {"ok": True}
