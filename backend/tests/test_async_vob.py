import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from app.main import app
from app.core.database import get_session
from app.models.job import Job, JobStatus
from unittest.mock import patch, AsyncMock

# Setup test DB
sqlite_file_name = "database_test.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"
engine = create_engine(sqlite_url, connect_args={"check_same_thread": False})

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session_override():
    with Session(engine) as session:
        yield session

app.dependency_overrides[get_session] = get_session_override

@pytest.fixture(name="client")
def client_fixture():
    create_db_and_tables()
    with TestClient(app) as client:
        yield client
    SQLModel.metadata.drop_all(engine)

def test_check_async_endpoint(client):
    payload = {
        "practice_id": "test",
        "patient": {
            "first_name": "John",
            "last_name": "Doe",
            "dob": "1980-01-01",
            "member_id": "123"
        },
        "payer": {
            "name": "Aetna",
            "payer_code_hint": "PAYER123"
        },
        "provider": {
            "npi": "1234567890"
        },
        "services": [
            {"cpt": "99213"}
        ]
    }
    
    # Mock background task to avoid actual execution
    with patch("app.api.v1.endpoints.async_vob.process_job") as mock_process:
        response = client.post("/v1/vob/check_async", json=payload)
        assert response.status_code == 202
        data = response.json()
        assert "job_id" in data
        assert data["status"] == "queued"
        
        job_id = data["job_id"]
        
        # Check status endpoint
        response = client.get(f"/v1/vob/status/{job_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["job_id"] == job_id
        assert data["status"] == "queued"
