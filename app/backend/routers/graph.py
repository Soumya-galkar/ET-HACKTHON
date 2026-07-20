from fastapi import APIRouter, Depends, Request
from utils.security import get_current_user

router = APIRouter(prefix="/graph", tags=["graph"])


@router.get("")
async def get_graph(request: Request, uid: str = Depends(get_current_user)):
    db = request.app.state.db
    # aggregate entities by (label, type) to consolidate cross-document duplicates
    ent_cursor = db.entities.find({"user_id": uid}, {"_id": 0})
    label_to_node = {}
    id_to_label = {}
    async for e in ent_cursor:
        key = (e["label"], e["type"])
        if key not in label_to_node:
            label_to_node[key] = {
                "id": f"{e['type']}::{e['label']}",
                "label": e["label"],
                "type": e["type"],
                "description": e.get("description", ""),
                "documents": [e["document_id"]],
                "mentions": 1,
            }
        else:
            n = label_to_node[key]
            n["mentions"] += 1
            if e["document_id"] not in n["documents"]:
                n["documents"].append(e["document_id"])
        id_to_label[e["id"]] = e["label"]

    nodes = list(label_to_node.values())

    # edges
    edges = []
    seen_edges = set()
    async for r in db.relationships.find({"user_id": uid}, {"_id": 0}):
        s_label = id_to_label.get(r["source_id"])
        t_label = id_to_label.get(r["target_id"])
        if not s_label or not t_label:
            continue
        # find node ids
        s_node = next((n["id"] for n in nodes if n["label"] == s_label), None)
        t_node = next((n["id"] for n in nodes if n["label"] == t_label), None)
        if not s_node or not t_node:
            continue
        key = (s_node, t_node, r["label"])
        if key in seen_edges:
            continue
        seen_edges.add(key)
        edges.append({
            "id": f"e_{len(edges)}",
            "source": s_node,
            "target": t_node,
            "label": r["label"],
        })

    # stats
    type_counts = {}
    for n in nodes:
        type_counts[n["type"]] = type_counts.get(n["type"], 0) + 1

    return {
        "nodes": nodes,
        "edges": edges,
        "stats": {"total_nodes": len(nodes), "total_edges": len(edges), "by_type": type_counts},
    }
