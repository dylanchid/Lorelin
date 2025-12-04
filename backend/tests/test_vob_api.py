from fastapi.testclient import TestClient
from app.main import app
from app.models.domain import VoBRequest

client = TestClient(app)

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Lorelin VoB API is running"}

def test_check_eligibility_sync_stedi():
    payload = {
        "practice_id": "test-practice",
        "patient": {
            "first_name": "Jane",
            "last_name": "Doe",
            "dob": "1985-03-12",
            "member_id": "XYZ123"
        },
        "payer": {
            "name": "Aetna"
        },
        "provider": {
            "npi": "1234567890"
        },
        "services": [
            {"cpt": "99213"}
        ]
    }
    response = client.post("/v1/vob/check_sync", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["source"] == "stedi"
    assert data["coverage_status"] == "active"

def test_check_eligibility_sync_rpa():
    payload = {
        "practice_id": "test-practice",
        "patient": {
            "first_name": "Jane",
            "last_name": "Doe",
            "dob": "1985-03-12",
            "member_id": "XYZ123"
        },
        "payer": {
            "name": "Local RPA Payer"
        },
        "provider": {
            "npi": "1234567890"
        },
        "services": [
            {"cpt": "99213"}
        ]
    }
    response = client.post("/v1/vob/check_sync", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["source"] == "rpa"
