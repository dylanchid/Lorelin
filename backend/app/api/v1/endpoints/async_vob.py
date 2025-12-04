from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from fastapi.encoders import jsonable_encoder
from sqlmodel import Session, select
from typing import Dict, Any, List
from datetime import datetime
import asyncio

from ....models.domain import VoBRequest, VoBResult
from ....models.job import Job, JobStatus
from ....core.db import get_session
from ....connectors.rpa import RPAConnector
from ....connectors.stedi import StediConnector

router = APIRouter()

async def process_job(job_id: str, request: VoBRequest, session: Session):
    # Re-fetch job to ensure we have the latest session state if needed, 
    # but here we pass session. Ideally we should create a new session for the background task
    # or handle session scope carefully. For simplicity, we'll assume a new session is needed.
    # But BackgroundTasks runs after response, so dependency injection session might be closed.
    # We should create a new session here.
    from ....core.db import engine
    from sqlmodel import Session as SQLSession
    
    with SQLSession(engine) as db:
        job = db.get(Job, job_id)
        if not job:
            return

        job.status = JobStatus.PROCESSING
        job.progress_step = "starting_connector"
        job.progress_percent = 10
        db.add(job)
        db.commit()
        
        try:
            # Determine connector based on request or config
            # For this phase, we default to RPA if not specified, or based on logic
            # Here we'll just use RPAConnector for demonstration of the RPA phase
            connector = RPAConnector()
            
            job.progress_step = "running_rpa"
            job.progress_percent = 30
            db.add(job)
            db.commit()
            
            result = await connector.check_eligibility(request)
            
            job.result = jsonable_encoder(result)
            job.status = JobStatus.COMPLETED
            job.progress_step = "completed"
            job.progress_percent = 100
            job.updated_at = datetime.now()
            
        except Exception as e:
            job.status = JobStatus.FAILED
            job.error_message = str(e)
            job.updated_at = datetime.now()
        
        db.add(job)
        db.commit()

@router.post("/check_async", status_code=202)
async def check_eligibility_async(
    request: VoBRequest, 
    background_tasks: BackgroundTasks,
    session: Session = Depends(get_session)
):
    # Create Job
    job = Job(
        request_payload=jsonable_encoder(request),
        status=JobStatus.QUEUED
    )
    session.add(job)
    session.commit()
    session.refresh(job)
    
    # Trigger background task
    background_tasks.add_task(process_job, job.id, request, session)
    
    return {
        "job_id": job.id,
        "status": job.status,
        "estimated_completion_seconds": 30,
        "poll_url": f"/api/v1/vob/status/{job.id}"
    }

@router.get("/status/{job_id}")
async def get_job_status(job_id: str, session: Session = Depends(get_session)):
    job = session.get(Job, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    response = {
        "job_id": job.id,
        "status": job.status,
        "created_at": job.created_at,
        "updated_at": job.updated_at
    }
    
    if job.status == JobStatus.PROCESSING:
        response["progress"] = {
            "step": job.progress_step,
            "percent": job.progress_percent
        }
        response["estimated_remaining_seconds"] = 15 # Mock
        
    if job.status == JobStatus.COMPLETED:
        response["result"] = job.result
        
    if job.status == JobStatus.FAILED:
        response["error"] = job.error_message
        
    return response


