"""AI-generated maintenance intelligence reports."""
import json
import re
from typing import Dict, Any, List

from services.llm import generate
from services.rag import retrieve

SYSTEM = (
    "You are a senior industrial maintenance engineer. "
    "You produce structured, grounded maintenance intelligence reports. "
    "Return ONLY valid JSON with no prose or code fences."
)

TEMPLATE = """Generate a maintenance intelligence report for equipment: "{equipment}".

Additional context from user: {user_ctx}

RETRIEVED DOCUMENTS:
{ctx}

Return JSON with this exact shape:
{{
  "failure_summary": "string",
  "root_cause": "string",
  "risk_level": "low|medium|high|critical",
  "recommended_actions": ["string", ...],
  "preventive_maintenance": ["string", ...],
  "predictive_maintenance": ["string", ...],
  "required_parts": ["string", ...],
  "required_skills": ["string", ...],
  "estimated_downtime": "e.g. '4 hours'"
}}

Ground every field in the retrieved documents. If no data is available for a field, use an empty string or empty list."""


def _parse(raw: str) -> Dict[str, Any]:
    raw = re.sub(r"^```(?:json)?", "", (raw or "").strip())
    raw = re.sub(r"```$", "", raw.strip())
    s, e = raw.find("{"), raw.rfind("}")
    if s == -1:
        return {}
    try:
        return json.loads(raw[s : e + 1])
    except Exception:
        return {}


def _as_list(v) -> List[str]:
    if isinstance(v, list):
        return [str(x) for x in v if x]
    if isinstance(v, str) and v.strip():
        return [v]
    return []


async def generate_maintenance_report(db, user_id: str, equipment: str, user_ctx: str = "") -> Dict[str, Any]:
    q = f"failure, root cause, maintenance, inspection and risk for equipment {equipment}"
    ctxs = await retrieve(db, user_id, q, top_k=6)
    ctx_block = "\n\n".join(
        f"[{i+1}] {c['text']}" for i, c in enumerate(ctxs)
    ) or "(no documents indexed yet)"
    prompt = TEMPLATE.format(equipment=equipment, user_ctx=user_ctx or "(none)", ctx=ctx_block)
    raw = await generate(f"maint-{equipment}", SYSTEM, prompt)
    data = _parse(raw)
    report = {
        "equipment": equipment,
        "failure_summary": str(data.get("failure_summary", "")),
        "root_cause": str(data.get("root_cause", "")),
        "risk_level": str(data.get("risk_level", "medium")).lower(),
        "recommended_actions": _as_list(data.get("recommended_actions")),
        "preventive_maintenance": _as_list(data.get("preventive_maintenance")),
        "predictive_maintenance": _as_list(data.get("predictive_maintenance")),
        "required_parts": _as_list(data.get("required_parts")),
        "required_skills": _as_list(data.get("required_skills")),
        "estimated_downtime": str(data.get("estimated_downtime", "")),
        "sources": [
            {"document_id": c["document_id"], "chunk_id": c["chunk_id"], "score": c["score"]}
            for c in ctxs
        ],
    }
    return report
