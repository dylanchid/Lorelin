from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session
from ..models.domain import VoBRequest, VoBResult
from ..core.router import VoBRouter
from ..core.auth import get_current_user
from ..core.db import get_session

router = APIRouter()
vob_router = VoBRouter()

@router.post("/check_sync", response_model=VoBResult)
async def check_eligibility_sync(
    request: VoBRequest, 
    user: dict = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Synchronous eligibility check.
    """
    try:
        result = await vob_router.route_request(request, session)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


