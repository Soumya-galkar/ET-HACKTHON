"""Document processing pipeline: extract -> chunk -> embed -> entities -> graph."""
from typing import Dict

from utils.extractors import extract_by_type
from utils.chunker import chunk_text
from utils.embeddings import embed_texts
from services.entity_extraction import extract_entities_and_relations
from models import Chunk, Entity, Relationship


async def process_document(db, user_id: str, doc_id: str, path: str, ext: str) -> Dict:
    """Run full pipeline. Updates the document row in-place."""
    try:
        text, pages = extract_by_type(path, ext)
        text = (text or "").strip()

        chunks = chunk_text(text)
        embeddings = embed_texts(chunks) if chunks else []

        # persist chunks
        chunk_docs = []
        for i, (c, emb) in enumerate(zip(chunks, embeddings)):
            chunk_docs.append(Chunk(
                user_id=user_id, document_id=doc_id, index=i, text=c, embedding=emb,
            ).model_dump())
        if chunk_docs:
            await db.chunks.insert_many(chunk_docs)

        # entities & relations via LLM (best-effort)
        entity_count = 0
        rel_count = 0
        entity_id_by_label = {}
        try:
            ext_result = await extract_entities_and_relations(doc_id, text)
            ent_docs = []
            for e in ext_result["entities"]:
                ent = Entity(
                    user_id=user_id, document_id=doc_id,
                    label=e["label"], type=e["type"], description=e["description"],
                )
                entity_id_by_label[e["label"]] = ent.id
                ent_docs.append(ent.model_dump())
            if ent_docs:
                await db.entities.insert_many(ent_docs)
                entity_count = len(ent_docs)
            rel_docs = []
            for r in ext_result["relationships"]:
                src_id = entity_id_by_label.get(r["source"])
                tgt_id = entity_id_by_label.get(r["target"])
                if not src_id or not tgt_id:
                    continue
                rel_docs.append(Relationship(
                    user_id=user_id, document_id=doc_id,
                    source_id=src_id, target_id=tgt_id, label=r["label"],
                ).model_dump())
            if rel_docs:
                await db.relationships.insert_many(rel_docs)
                rel_count = len(rel_docs)
        except Exception as ex:
            # entity extraction is best-effort
            print(f"[entity_extraction] {ex}")

        await db.documents.update_one(
            {"id": doc_id},
            {"$set": {
                "status": "ready",
                "page_count": pages,
                "chunk_count": len(chunk_docs),
                "entity_count": entity_count,
                "metadata.text_length": len(text),
                "metadata.relationships": rel_count,
            }},
        )
        return {"ok": True, "chunks": len(chunk_docs), "entities": entity_count}
    except Exception as ex:
        await db.documents.update_one(
            {"id": doc_id},
            {"$set": {"status": "failed", "error": str(ex)[:500]}},
        )
        return {"ok": False, "error": str(ex)}
