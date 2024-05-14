#!/bin/bash

# Uncomment the following lines to install bun and uv
# curl -fsSL https://bun.sh/install | bash

# Start the frontend dev server
cd web
bun install
bun run dev &
FRONTEND_PID=$!

# Start the backend dev server
cd api
pip install -r requirements.txt
uvicorn app:app --reload --port 5000 &
BACKEND_PID=$!

# Function to kill both processes
cleanup() {
  echo "Stopping frontend and backend servers..."
  kill $FRONTEND_PID
  kill $BACKEND_PID
}

# Trap the EXIT signal to clean up
trap cleanup EXIT

# Wait for both processes to finish
wait $FRONTEND_PID
wait $BACKEND_PID
