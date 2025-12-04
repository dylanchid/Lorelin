import httpx
import json
import time
import asyncio

BASE_URL = "http://localhost:8000"

async def test_vob_check():
    print("Testing VoB Check...")
    
    payload = {
        "practice_id": "practice_123",
        "payer": {
            "name": "Aetna", # Should map to Stedi
            "payer_code_hint": "60054"
        },
        "provider": {
            "npi": "1234567890"
        },
        "patient": {
            "member_id": "123456789",
            "first_name": "John",
            "last_name": "StediUser",
            "dob": "1980-01-01"
        },
        "visit_date": "2023-10-27"
    }
    
    async with httpx.AsyncClient() as client:
        # First request (should hit Stedi)
        start_time = time.time()
        response = await client.post(f"{BASE_URL}/v1/vob/check_sync", json=payload, timeout=30.0)
        duration1 = time.time() - start_time
        
        if response.status_code != 200:
            print(f"Error: {response.status_code} - {response.text}")
            return
            
        data = response.json()
        print(f"Response 1 (Time: {duration1:.2f}s):")
        print(json.dumps(data, indent=2))
        
        if data.get("source") != "STEDI":
            print(f"WARNING: Expected source STEDI, got {data.get('source')}")
        
        # Second request (should hit Cache)
        start_time = time.time()
        response = await client.post(f"{BASE_URL}/v1/vob/check_sync", json=payload, timeout=30.0)
        duration2 = time.time() - start_time
        
        data2 = response.json()
        print(f"Response 2 (Time: {duration2:.2f}s):")
        
        if duration2 < duration1:
            print("Cache seems to be working (Response 2 was faster).")
        else:
            print("Cache might not be working or network is variable.")

        if data == data2:
            print("Responses match.")
        else:
            print("Responses do NOT match.")

if __name__ == "__main__":
    asyncio.run(test_vob_check())
