import uuid
from datetime import datetime, UTC

FAKE_HONEYTOKEN_TEMPLATE = {
    "name": "John Doe",
    "email": "john.doe@example.com",
    "record_id": "",
    "timestamp": ""
}

def generate_honeytoken():
    """
    Generate a randomized fake honeytoken record for intrusion detection.
    """
    token = FAKE_HONEYTOKEN_TEMPLATE.copy()
    token["record_id"] = str(uuid.uuid4())
    token["timestamp"] = datetime.now(UTC).isoformat()
    return token 