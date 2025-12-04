from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from ..core.db import get_session
from ..connectors.stedi import StediConnector
from ..connectors.rpa import RPAConnector
from ..connectors.mock import MockConnector

router = APIRouter()

@router.get("/health")
async def health_check(session: Session = Depends(get_session)):
    """
    Health check endpoint to verify service and dependency status.
    """
    status = {
        "status": "healthy",
        "database": "unknown",
        "connectors": {
            "stedi": "unknown",
            "rpa": "unknown",
            "mock": "unknown"
        }
    }
    
    # Check Database
    try:
        session.exec(select(1)).first()
        status["database"] = "connected"
    except Exception as e:
        status["database"] = "disconnected"
        status["status"] = "unhealthy"
        
    # Check Connectors
    stedi = StediConnector()
    rpa = RPAConnector()
    mock = MockConnector()
    
    status["connectors"]["stedi"] = "connected" if await stedi.health_check() else "disconnected"
    status["connectors"]["rpa"] = "connected" if await rpa.health_check() else "disconnected"
    status["connectors"]["mock"] = "connected" if await mock.health_check() else "disconnected"
    
    if any(v == "disconnected" for v in status["connectors"].values()):
        # Consider partial degradation if critical connectors fail
        # For now, just logging it, overall status might still be healthy if fallback exists
        pass

    return status
