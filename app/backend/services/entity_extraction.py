"""Extract industrial entities and relationships from document text using Gemini."""
import json
import re
from typing import Dict, List

from services.llm import generate

ENTITY_TYPES = [
    "Equipment", "WorkOrder", "Department", "Technician", "MaintenanceTask",
    "Inspection", "Pressure", "Temperature", "Alarm", "Risk", "Failure",
    "Manual", "OEM", "Document",
]

SYSTEM = (
    "You are an industrial knowledge extraction engine. Extract entities and "
    "relationships from industrial/maintenance/engineering text. Return ONLY valid JSON."
)

PROMPT_TMPL = """Extract entities and relationships from the text below.

Valid entity types: {types}

Return JSON with this exact shape (no prose, no code fences):
{{
  "entities": [{{"label": "...", "type": "Equipment", "description": "short"}}],
  "relationships": [{{"source": "labelA", "target": "labelB", "label": "verb_phrase"}}]
}}

Rules:
- label = canonical short name (e.g., "Pump P-101")
- Return at most 25 entities and 25 relationships.
- Deduplicate.
- Skip trivial mentions.

TEXT:
\"\"\"
{text}
\"\"\"
"""


def _parse_json_block(raw: str) -> Dict:
    if not raw:
        return {"entities": [], "relationships": []}
    # strip code fences
    raw = re.sub(r"^```(?:json)?", "", raw.strip())
    raw = re.sub(r"```$", "", raw.strip())
    # find first { .. last }
    start = raw.find("{")
    end = raw.rfind("}")
    if start == -1 or end == -1:
        return {"entities": [], "relationships": []}
    try:
        return json.loads(raw[start : end + 1])
    except Exception:
        return {"entities": [], "relationships": []}


async def extract_entities_and_relations(document_id: str, text: str) -> Dict[str, List[Dict]]:
    # cap length to protect LLM
    snippet = text[:12000]
    prompt = PROMPT_TMPL.format(types=", ".join(ENTITY_TYPES), text=snippet)
    raw = await generate(session_id=f"extract-{document_id}", system=SYSTEM, prompt=prompt)
    data = _parse_json_block(raw)
    ents = data.get("entities") or []
    rels = data.get("relationships") or []
    # normalize
    cleaned_ents = []
    for e in ents:
        if not isinstance(e, dict):
            continue
        label = (e.get("label") or "").strip()
        etype = (e.get("type") or "").strip()
        if not label or etype not in ENTITY_TYPES:
            continue
        cleaned_ents.append({
            "label": label[:120],
            "type": etype,
            "description": (e.get("description") or "")[:400],
        })
    cleaned_rels = []
    for r in rels:
        if not isinstance(r, dict):
            continue
        s = (r.get("source") or "").strip()
        t = (r.get("target") or "").strip()
        lbl = (r.get("label") or "").strip()
        if s and t and lbl:
            cleaned_rels.append({"source": s[:120], "target": t[:120], "label": lbl[:80]})
    return {"entities": cleaned_ents, "relationships": cleaned_rels}
