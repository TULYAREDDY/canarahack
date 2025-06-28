from flask import Flask, jsonify, request
from flask_cors import CORS
from watermarking.generator import generate_watermark
from honeytokens.schema import generate_honeytoken
from policy.metadata_format import generate_policy
from api.auth import check_api_key
from datetime import datetime, date, UTC
from risk_engine import calculate_risk_score, partner_scores

app = Flask(__name__)
CORS(app)

# 1️⃣ Global log store
access_logs = []
# Simulated user notifications
user_notifications = []
# Simulated user consent (True = sharing allowed)
user_consent = {"allowed": True}
# Simulated last shared policy (for partner access checks)
last_policy = {"expiry_date": "2099-12-31", "geo_restriction": "IN"}
alerts = []
restriction_requests = []
restricted_partners = set()

# 2️⃣ Logging function

def log_access(request, endpoint, status_code):
    log_entry = {
        "ip": request.remote_addr,
        "method": request.method,
        "endpoint": endpoint,
        "timestamp": datetime.now(UTC).isoformat(),
        "status": status_code,
        "user_agent": request.headers.get("User-Agent", "unknown")
    }
    access_logs.append(log_entry)

@app.route('/health')
def health():
    log_access(request, "/health", 200)
    """Health check endpoint."""
    return jsonify({
        "status": "running",
        "service": "Data Sentinel Backend",
        "version": "1.0.0",
        "message": "Backend is healthy and ready!"
    })

@app.route('/generate_watermark', methods=['POST'])
def api_generate_watermark():
    if not check_api_key(request):
        log_access(request, "/generate_watermark", 401)
        return jsonify({"error": "Unauthorized"}), 401
    data = request.get_json()
    content = data.get('content')
    partner_id = data.get('partner_id')
    if not content or not partner_id:
        log_access(request, "/generate_watermark", 400)
        return jsonify({"error": "Missing content or partner_id"}), 400
    hash_value = generate_watermark(content, partner_id)
    log_access(request, "/generate_watermark", 200)
    return jsonify({"watermark": hash_value})

@app.route('/generate_honeytoken', methods=['GET'])
def api_generate_honeytoken():
    if not check_api_key(request):
        log_access(request, "/generate_honeytoken", 401)
        return jsonify({"error": "Unauthorized"}), 401
    partner_id = request.args.get('partner_id') or request.headers.get('X-Partner-Id')
    token = generate_honeytoken()
    # Risk scoring: only if partner_id is present
    if partner_id:
        calculate_risk_score(partner_id, "/generate_honeytoken")
    log_access(request, "/generate_honeytoken", 200)
    return jsonify(token)

@app.route('/generate_policy', methods=['POST'])
def api_generate_policy():
    if not check_api_key(request):
        log_access(request, "/generate_policy", 401)
        return jsonify({"error": "Unauthorized"}), 401
    data = request.get_json()
    purpose = data.get('purpose')
    days_valid = data.get('days_valid')
    region = data.get('region')
    if not purpose or days_valid is None or not region:
        log_access(request, "/generate_policy", 400)
        return jsonify({"error": "Missing purpose, days_valid, or region"}), 400
    try:
        days_valid = int(days_valid)
    except ValueError:
        log_access(request, "/generate_policy", 400)
        return jsonify({"error": "days_valid must be an integer"}), 400
    policy = generate_policy(purpose, days_valid, region)
    # Update last_policy for partner access checks
    last_policy["expiry_date"] = policy["expiry_date"]
    last_policy["geo_restriction"] = policy["geo_restriction"]
    log_access(request, "/generate_policy", 200)
    return jsonify(policy)

# 4️⃣ Access log endpoint
@app.route('/access_log', methods=['GET'])
def get_access_log():
    log_access(request, "/access_log", 200)
    return jsonify(access_logs), 200

# 5️⃣ User notifications endpoint
@app.route('/user_notifications', methods=['GET'])
def get_user_notifications():
    log_access(request, "/user_notifications", 200)
    return jsonify(user_notifications), 200

# 6️⃣ User consent toggle endpoint
@app.route('/set_consent', methods=['POST'])
def set_consent():
    data = request.get_json()
    allowed = data.get('allowed')
    user_consent["allowed"] = bool(allowed)
    log_access(request, "/set_consent", 200)
    return jsonify({"consent": user_consent["allowed"]}), 200

# 7️⃣ Partner secure data request endpoint
@app.route('/alerts/<user_id>', methods=['GET'])
def get_alerts(user_id):
    user_alerts = [a for a in alerts if a["to"] == user_id]
    return jsonify(user_alerts), 200

@app.route('/request_restriction', methods=['POST'])
def request_restriction():
    data = request.get_json()
    partner_id = data.get('partner_id')
    user_id = data.get('user_id', 'user1')
    restriction_requests.append({"partner_id": partner_id, "user_id": user_id, "timestamp": datetime.now(UTC).isoformat()})
    alerts.append({
        "to": "admin",
        "partner": partner_id,
        "risk": partner_scores.get(partner_id, 0),
        "message": f"User requested restriction for {partner_id}"
    })
    return jsonify({"status": "Restriction requested"}), 200

@app.route('/restrict_partner_access', methods=['POST'])
def restrict_partner_access():
    data = request.get_json()
    partner_id = data.get('partner_id')
    restricted_partners.add(partner_id)
    alerts.append({
        "to": "user1",
        "partner": partner_id,
        "risk": partner_scores.get(partner_id, 0),
        "message": f"Admin restricted access for {partner_id}"
    })
    return jsonify({"status": f"Access for {partner_id} restricted"}), 200

@app.route('/partner_request_data', methods=['POST'])
def partner_request_data():
    if not check_api_key(request):
        log_access(request, "/partner_request_data", 401)
        return jsonify({"error": "Unauthorized"}), 401
    data = request.get_json()
    partner_id = data.get('partner_id')
    region = data.get('region')
    # Simulate user data
    user_data = {"name": "Alice User"}
    # Policy checks
    policy_expiry = last_policy.get("expiry_date", "2099-12-31")
    policy_region = last_policy.get("geo_restriction", "IN")
    # Restriction check
    if partner_id in restricted_partners:
        log_access(request, "/partner_request_data", 403)
        return jsonify({"error": "Access Denied: Partner Restricted"}), 403
    # Check consent
    if not user_consent["allowed"]:
        log_access(request, "/partner_request_data", 403)
        return jsonify({"error": "Access Denied: Consent Revoked"}), 403
    # Check region
    if region != policy_region:
        log_access(request, "/partner_request_data", 403)
        return jsonify({"error": "Access Denied: Region Restriction"}), 403
    # Check expiry
    if date.today().isoformat() > policy_expiry:
        log_access(request, "/partner_request_data", 403)
        return jsonify({"error": "Access Denied: Policy Expired"}), 403
    # Risk scoring
    risk = calculate_risk_score(partner_id, request.path)
    print(f"[DEBUG] Current partner_scores: {partner_scores}")  # Debug print
    if risk > 10:
        alerts.append({
            "to": "user1",
            "partner": partner_id,
            "risk": risk,
            "message": f"High risk detected for {partner_id}"
        })
        # Only notify user if risk is high
        notification = {
            "message": f"ALERT: High risk detected for partner '{partner_id}' on {datetime.now(UTC).isoformat()}.",
            "timestamp": datetime.now(UTC).isoformat(),
            "partner_id": partner_id
        }
        user_notifications.append(notification)
    log_access(request, "/partner_request_data", 200)
    return jsonify({
        "user_name": user_data["name"],
        "policy_expiry": policy_expiry
    }), 200

if __name__ == '__main__':
    app.run(port=5000) 