import sys
print("Starting granular import debug...", flush=True)

try:
    print("Importing typing...", flush=True)
    from typing import Optional
    print("Importing datetime...", flush=True)
    from datetime import datetime
    
    print("Importing playwright.async_api...", flush=True)
    from playwright.async_api import async_playwright
    print("Imported playwright", flush=True)
    
    print("Importing browserbase...", flush=True)
    try:
        from browserbase import Browserbase
        print("Imported browserbase", flush=True)
    except ImportError:
        print("Browserbase not found", flush=True)
        
    print("Importing models...", flush=True)
    from app.models.domain import VoBRequest
    print("Imported models", flush=True)
    
    print("Importing config...", flush=True)
    from app.core.config import settings
    print("Imported config", flush=True)
    
    print("Importing base connector...", flush=True)
    from app.connectors.base import BaseConnector
    print("Imported base connector", flush=True)

except Exception as e:
    print(f"Error: {e}", flush=True)

print("Done", flush=True)
