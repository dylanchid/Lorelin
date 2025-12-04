import sys
import os
from fastapi.testclient import TestClient

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

try:
    from app.main import app
    
    client = TestClient(app)
    
    response = client.get("/")
    assert response.status_code == 200
    print("Root endpoint verified")
    
    # Check if new routes are present
    routes = [route.path for route in app.routes]
    if "/v1/vob/check_async" in routes:
        print("Async endpoint /v1/vob/check_async found")
    else:
        print("Async endpoint /v1/vob/check_async NOT found")
        sys.exit(1)
        
    print("App startup verification passed!")
    
except ImportError as e:
    print(f"ImportError: {e}")
    sys.exit(1)
except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
