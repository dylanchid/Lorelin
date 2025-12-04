import sys
print("Starting models debug (no sqlmodel)...", flush=True)
try:
    print("Importing app.models.domain...", flush=True)
    from app.models.domain import VoBRequest
    print("Imported VoBRequest", flush=True)
except Exception as e:
    print(f"Error: {e}", flush=True)
print("Done", flush=True)
