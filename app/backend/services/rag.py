"""RAG retrieval + grounded answer generation."""
from typing import List, Dict, Any

from utils.embeddings import embed_one, cosine_sim
from services.llm import generate


async def retrieve(db, user_id: str, query: str, top_k: int = 6) -> List[Dict[str, Any]]:
    q_vec = embed_one(query)
    cursor = db.chunks.find({"user_id": user_id}, {"_id": 0})
    results = []
    async for c in cursor:
        emb = c.get("embedding") or []
        if not emb:
            continue
        score = cosine_sim(q_vec, emb)
        results.append({
            "chunk_id": c["id"],
            "document_id": c["document_id"],
            "text": c["text"],
            "index": c.get("index"),
            "page": c.get("page"),
            "score": score,
        })
    results.sort(key=lambda x: x["score"], reverse=True)
    return results[:top_k]


SYSTEM_ASSISTANT = (
    "You are an industrial knowledge assistant for engineers and technicians. "
    "You answer questions about equipment, maintenance history, operating procedures, "
    "safety instructions, OEM manuals, failure analysis, inspection reports, and risk analysis. "
    "You MUST ground every answer strictly in the provided context. "
    "If the context does not contain the answer, say clearly: "
    "\"I don't have enough information in the indexed documents to answer that.\" "
    "Be concise, technical and precise. Cite sources by their [#index] markers."
)


async def answer_with_context(session_id: str, query: str, contexts: List[Dict[str, Any]]) -> str:
    if not contexts:
        return "I don't have enough information in the indexed documents to answer that."
    ctx_block = "\n\n".join(
        f"[{i+1}] (doc:{c['document_id'][:8]} score:{c['score']:.2f})\n{c['text']}"
        for i, c in enumerate(contexts)
    )
    prompt = f"""CONTEXT:
{ctx_block}

QUESTION: {query}

Answer using only the CONTEXT above. Cite the source markers like [1], [2] in your answer."""
    return await generate(session_id, SYSTEM_ASSISTANT, prompt)
