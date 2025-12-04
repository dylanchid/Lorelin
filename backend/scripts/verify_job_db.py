from app.core.database import engine
from sqlmodel import Session, select
from app.models.job import Job, JobStatus

def verify_job_table():
    output = ""
    try:
        with Session(engine) as session:
            job = Job(status=JobStatus.QUEUED)
            session.add(job)
            session.commit()
            session.refresh(job)
            output += f"Successfully created job with ID: {job.id}\n"
            
            # Read it back
            fetched_job = session.get(Job, job.id)
            output += f"Fetched job status: {fetched_job.status}\n"
            
    except Exception as e:
        output += f"Error: {e}\n"
    
    with open("verify_job_db_output.txt", "w") as f:
        f.write(output)

if __name__ == "__main__":
    verify_job_table()
