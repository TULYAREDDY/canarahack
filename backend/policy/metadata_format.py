from datetime import datetime, timedelta

DEFAULT_POLICY_TEMPLATE = {
    "purpose": "",
    "expiry_date": "",
    "retention_policy": "standard",
    "geo_restriction": ""
}

def generate_policy(purpose, days_valid, region):
    """
    Generate policy metadata with expiry date and region.
    """
    expiry = (datetime.utcnow() + timedelta(days=days_valid)).date().isoformat()
    policy = DEFAULT_POLICY_TEMPLATE.copy()
    policy["purpose"] = purpose
    policy["expiry_date"] = expiry
    policy["geo_restriction"] = region
    return policy 