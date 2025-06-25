import hashlib

def generate_watermark(content, partner_id):
    """
    Generate a SHA-256 watermark for partner-specific data tracking.
    Combines the content and partner_id to create a unique hash.
    """
    combined = f"{content}{partner_id}".encode('utf-8')
    return hashlib.sha256(combined).hexdigest() 