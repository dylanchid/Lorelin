import sys
print("Starting import debug...", flush=True)

try:
    print("Importing app.connectors.rpa...", flush=True)
    from app.connectors.rpa import RPAConnector
    print("Imported RPAConnector", flush=True)
except Exception as e:
    print(f"Failed to import RPAConnector: {e}", flush=True)

print("Done", flush=True)
