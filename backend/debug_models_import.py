import sys
print("Starting models debug...", flush=True)
try:
    print("Importing pydantic...", flush=True)
    import pydantic
    print("Imported pydantic", flush=True)

    print("Importing sqlmodel...", flush=True)
    from sqlmodel import SQLModel
    print("Imported sqlmodel", flush=True)
    
    print("Importing app.models.domain...", flush=True)
    from app.models.domain import VoBRequest
    print("Imported VoBRequest", flush=True)
except Exception as e:
    print(f"Error: {e}", flush=True)
print("Done", flush=True)
