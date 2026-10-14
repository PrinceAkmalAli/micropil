# Micropil FastAPI backend (drop-in replacement for the Node backend)

    python -m venv venv && source venv/bin/activate      (Windows: venv\Scripts\activate)
    pip install -r requirements.txt
    cp .env.example .env                                  (set ADMIN_PASS before first run)
    uvicorn main:app --port 5000 --reload

Same routes and same data.json as the Node version, so the React frontend works unchanged (Vite proxy already points to port 5000).
You can copy your old backend/data.json and backend/uploads folder here and everything keeps working, passwords included.
Interactive API docs: http://localhost:5000/docs
Production: uvicorn main:app --host 0.0.0.0 --port 5000 --workers 1   (keep 1 worker: data is a JSON file)
