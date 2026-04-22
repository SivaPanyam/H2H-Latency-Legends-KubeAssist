from fastapi.testclient import TestClient
from backend.main import app
import os

# Set environment variable for test
os.environ["ALLOWED_ORIGINS"] = "http://localhost:5173,http://localhost:5174,http://localhost:5175"

client = TestClient(app)

def test_cors_allowed_origin():
    # Test with one of the allowed origins
    response = client.get("/", headers={"Origin": "http://localhost:5173"})
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "http://localhost:5173"

def test_cors_disallowed_origin():
    # Test with a disallowed origin
    response = client.get("/", headers={"Origin": "http://evil.com"})
    assert "access-control-allow-origin" not in response.headers
