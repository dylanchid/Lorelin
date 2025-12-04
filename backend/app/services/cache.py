import redis
import os
import json

# Redis Cache Layer
# Connects to Redis instance defined in docker-compose.yml

REDIS_URL = os.environ.get("REDIS_URL", "redis://localhost:6379/0")

try:
    redis_client = redis.from_url(REDIS_URL, decode_responses=True)
except Exception as e:
    print(f"Warning: Could not connect to Redis: {e}")
    redis_client = None

def get_cached_vob(patient_id: int):
    if not redis_client:
        return None
    key = f"vob:{patient_id}"
    data = redis_client.get(key)
    if data:
        return json.loads(data)
    return None

def cache_vob(patient_id: int, data: dict, ttl: int = 86400): # Default 24h TTL
    if not redis_client:
        return
    key = f"vob:{patient_id}"
    redis_client.setex(key, ttl, json.dumps(data))
