#!/bin/bash

# Function to kill background processes on exit
cleanup() {
    echo "Stopping services..."
    kill $(jobs -p)
}
trap cleanup EXIT

# Start Infrastructure
echo "Starting Infrastructure..."
docker-compose up -d

# Start Backend
echo "Starting Backend..."
(cd backend && source ../venv/bin/activate && uvicorn main:app --reload) &

# Start RPA Portal
echo "Starting RPA Portal..."
(cd rpa_portal && source ../venv/bin/activate && python app.py) &

# Start Frontend
echo "Starting Frontend..."
npm run dev
