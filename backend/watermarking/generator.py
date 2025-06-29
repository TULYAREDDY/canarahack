import hashlib

def generate_watermark(partner_id, timestamp, user_id):
    """
    Generate a SHA-256 watermark for partner-specific data tracking.
    Combines partner_id, timestamp, and user_id to create a unique hash.
    """
    combined = f"{partner_id}|{timestamp}|{user_id}".encode('utf-8')
    return hashlib.sha256(combined).hexdigest() 