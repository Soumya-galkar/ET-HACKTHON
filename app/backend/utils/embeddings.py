"""Lazy-loaded sentence-transformers embeddings + cosine similarity utilities."""
from typing import List
import numpy as np

_model = None
_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"  # 384-dim, fast


def _get_model():
    global _model
    if _model is None:
        from sentence_transformers import SentenceTransformer
        _model = SentenceTransformer(_MODEL_NAME)
    return _model


def embed_texts(texts: List[str]) -> List[List[float]]:
    if not texts:
        return []
    model = _get_model()
    embs = model.encode(texts, convert_to_numpy=True, normalize_embeddings=True)
    return embs.tolist()


def embed_one(text: str) -> List[float]:
    return embed_texts([text])[0]


def cosine_sim(a: List[float], b: List[float]) -> float:
    va, vb = np.asarray(a, dtype=np.float32), np.asarray(b, dtype=np.float32)
    if va.size == 0 or vb.size == 0:
        return 0.0
    denom = (np.linalg.norm(va) * np.linalg.norm(vb)) or 1.0
    return float(np.dot(va, vb) / denom)
