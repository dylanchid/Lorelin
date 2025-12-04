import asyncio
import httpx
from datetime import date

BASE_URL = "http://localhost:8001"

async def test_health():
    print("Testing /health endpoint...")
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{BASE_URL}/health")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"

async def test_demo_check():
    print("\nTesting /v1/vob/check_sync (Demo Mode)...")
    payload = {
        "patient": {
            "first_name": "John",
            "last_name": "Doe", # Should trigger active_full_coverage scenario
            "date_of_birth": "1985-03-15",
            "member_id": "DEMO123",
            "group_number": "GRP1"
        },
        "payer": {
            "payer_id": "AETNA",
            "payer_name": "Aetna"
        },
        "procedure": {
            "cpt_code": "99213",
            "date_of_service": str(date.today())
        },
        "options": {
            "demo": True
        }
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(f"{BASE_URL}/v1/vob/check_sync", json=payload)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Source: {data['source']}")
            print(f"Status: {data['status']}")
            assert data["source"] == "mock"
            assert data["status"] == "active"
        else:
            print(f"Error: {response.text}")

if __name__ == "__main__":
    asyncio.run(test_health())
    asyncio.run(test_demo_check())
