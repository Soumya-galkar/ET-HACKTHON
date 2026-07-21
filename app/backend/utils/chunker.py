"""Simple recursive char-based chunker with overlap."""
from typing import List


def chunk_text(text: str, chunk_size: int = 900, overlap: int = 120) -> List[str]:
    text = (text or "").strip()
    if not text:
        return []
    paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
    chunks: List[str] = []
    buf = ""
    for p in paragraphs:
        if len(buf) + len(p) + 2 <= chunk_size:
            buf = (buf + "\n\n" + p).strip()
        else:
            if buf:
                chunks.append(buf)
            if len(p) <= chunk_size:
                buf = p
            else:
                # long paragraph: hard-split with overlap
                start = 0
                step = max(1, chunk_size - overlap)
                while start < len(p):
                    chunks.append(p[start : start + chunk_size])
                    start += step
                buf = ""
    if buf:
        chunks.append(buf)
    return chunks
