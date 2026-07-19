from fastapi.testclient import TestClient

from app.main import app


def test_websocket_e2e_simulation_flow():
    client = TestClient(app)
    with client.websocket_connect("/ws") as websocket:
        # Trigger evacuation simulation
        websocket.send_json({
            "action": "trigger_simulation",
            "scenarioId": "00000000-0000-0000-0000-000000000000",
            "parameters": {
                "gateCount": 3,
                "initialDensity": 0.85,
                "hazardLocationId": "n-5"
            }
        })

        # Verify that we receive events back over the socket connection
        data = websocket.receive_json()
        assert "event" in data
        assert data["event"] in ["telemetry", "audit_log", "crisis_alert"]

def test_websocket_e2e_query_flow():
    client = TestClient(app)
    with client.websocket_connect("/ws") as websocket:
        # Execute query
        websocket.send_json({
            "action": "query",
            "queryText": "Where is Gate C?"
        })

        data = websocket.receive_json()
        assert "event" in data
        assert data["event"] in ["telemetry", "audit_log", "crisis_alert", "agent_state"]
