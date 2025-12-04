import requests
import json

url = "http://localhost:8000/v1/vob/check_async"
payload = {
    "practice_id": "practice_123",
    "patient": {
        "first_name": "John",
        "last_name": "Doe",
        "dob": "1980-01-01",
        "member_id": "MEM123"
    },
    "payer": {
        "name": "Aetna"
    },
    "provider": {
        "npi": "1234567890"
    }
}

try:
    response = requests.post(url, json=payload)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code == 202:
        data = response.json()
        with open("job_id.txt", "w") as f:
            f.write(data["job_id"])
except Exception as e:
    with open("error.log", "w") as f:
        f.write(str(e))
    print(f"Error: {e}")
