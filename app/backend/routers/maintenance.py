from fastapi import APIRouter, Depends, Request
from models import MaintenanceRequest, MaintenanceReport
from utils.security import get_current_user
from services.maintenance import generate_maintenance_report

router = APIRouter(prefix="/maintenance", tags=["maintenance"])


@router.post("/report")
async def create_report(payload: MaintenanceRequest, request: Request, uid: str = Depends(get_current_user)):
    db = request.app.state.db
    data = await generate_maintenance_report(db, uid, payload.equipment, payload.context or "")
    report = MaintenanceReport(user_id=uid, **data)
    await db.maintenance_reports.insert_one(report.model_dump())
    return report.model_dump()


@router.get("/reports")
async def list_reports(request: Request, uid: str = Depends(get_current_user)):
    db = request.app.state.db
    out = await db.maintenance_reports.find({"user_id": uid}, {"_id": 0}).sort("created_at", -1).to_list(200)
    return out
