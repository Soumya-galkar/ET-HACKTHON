from fastapi import APIRouter, Depends, Request
from utils.security import get_current_user

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("")
async def dashboard(request: Request, uid: str = Depends(get_current_user)):
    db = request.app.state.db

    total_docs = await db.documents.count_documents({"user_id": uid})
    processing = await db.documents.count_documents({"user_id": uid, "status": "processing"})
    ready = await db.documents.count_documents({"user_id": uid, "status": "ready"})
    failed = await db.documents.count_documents({"user_id": uid, "status": "failed"})
    equipment_count = await db.entities.count_documents({"user_id": uid, "type": "Equipment"})
    open_wo = await db.work_orders.count_documents({"user_id": uid, "status": {"$ne": "closed"}})
    total_wo = await db.work_orders.count_documents({"user_id": uid})
    total_chunks = await db.chunks.count_documents({"user_id": uid})

    recent_docs = await db.documents.find(
        {"user_id": uid}, {"_id": 0}
    ).sort("created_at", -1).limit(5).to_list(5)

    recent_wo = await db.work_orders.find(
        {"user_id": uid}, {"_id": 0}
    ).sort("created_at", -1).limit(5).to_list(5)

    # graph stats
    total_nodes = 0
    node_types = {}
    async for e in db.entities.find({"user_id": uid}, {"_id": 0, "label": 1, "type": 1}):
        node_types[e["type"]] = node_types.get(e["type"], 0) + 1
        total_nodes += 1
    total_edges = await db.relationships.count_documents({"user_id": uid})

    return {
        "totals": {
            "documents": total_docs,
            "equipment": equipment_count,
            "open_work_orders": open_wo,
            "total_work_orders": total_wo,
            "chunks": total_chunks,
        },
        "processing_status": {
            "processing": processing, "ready": ready, "failed": failed,
        },
        "graph_stats": {
            "total_nodes": total_nodes,
            "total_edges": total_edges,
            "by_type": node_types,
        },
        "recent_documents": [
            {
                "id": d["id"], "filename": d["filename"], "status": d["status"],
                "file_type": d["file_type"], "created_at": d["created_at"],
            } for d in recent_docs
        ],
        "recent_work_orders": recent_wo,
    }
