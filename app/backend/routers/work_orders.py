from fastapi import APIRouter, Depends, Request, HTTPException
from models import WorkOrder, WorkOrderIn
from utils.security import get_current_user

router = APIRouter(prefix="/work-orders", tags=["work_orders"])


@router.post("")
async def create(payload: WorkOrderIn, request: Request, uid: str = Depends(get_current_user)):
    db = request.app.state.db
    wo = WorkOrder(user_id=uid, **payload.model_dump())
    await db.work_orders.insert_one(wo.model_dump())
    return wo.model_dump()


@router.get("")
async def list_wo(request: Request, uid: str = Depends(get_current_user)):
    db = request.app.state.db
    out = await db.work_orders.find({"user_id": uid}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return out


@router.patch("/{wo_id}")
async def update(wo_id: str, payload: WorkOrderIn, request: Request, uid: str = Depends(get_current_user)):
    db = request.app.state.db
    res = await db.work_orders.update_one(
        {"id": wo_id, "user_id": uid}, {"$set": payload.model_dump()}
    )
    if res.matched_count == 0:
        raise HTTPException(404, "Work order not found")
    return {"ok": True}


@router.delete("/{wo_id}")
async def delete(wo_id: str, request: Request, uid: str = Depends(get_current_user)):
    db = request.app.state.db
    res = await db.work_orders.delete_one({"id": wo_id, "user_id": uid})
    if res.deleted_count == 0:
        raise HTTPException(404, "Work order not found")
    return {"ok": True}
