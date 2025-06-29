from flask import Flask, jsonify, request
from flask_cors import CORS, cross_origin
from watermarking.generator import generate_watermark
from honeytokens.schema import generate_honeytoken
from policy.metadata_format import generate_policy
from api.auth import check_api_key
from datetime import datetime, date, UTC
from risk_engine import calculate_risk_score, update_risk_score, partner_scores, partner_traits, restricted_partners, deception_state, detailed_access_log, alert_log, trap_hits, trap_impact_log
import random
from uuid import uuid4
from time import sleep
from random import randint
from utils.synthetic import generate_synthetic_data
import re

app = Flask(__name__)
CORS(app, 
     resources={r"/*": {"origins": "*"}}, 
     supports_credentials=True,
     allow_headers=["Content-Type", "X-API-Key"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

# 1️⃣ Global log store
access_logs = []
user_notifications = []
# --- NEW: User Access History Tracker ---
user_access_history = []  # For tracking partner access to users
# --- END NEW ---
# --- STEP 1: Multi-User Consent Management ---
consent_state = {
    "user1": {"watermark": True, "policy": True, "honeytoken": True, "expiry_date": "2025-07-30"},
    "user2": {"watermark": True, "policy": True, "honeytoken": True, "expiry_date": "2025-07-30"},
    "user3": {"watermark": True, "policy": True, "honeytoken": False, "expiry_date": "2025-07-30"}
}
# --- END STEP 1 ---
# Simulated last shared policy (for partner access checks)
last_policy = {"expiry_date": "2099-12-31", "geo_restriction": "IN"}
alerts = []
restriction_requests = []
# --- STEP 3: Trap logs ---
trap_logs = []
# --- END STEP 3 ---
# --- STEP 4: Risk scoring system ---
# partner_scores is imported from risk_engine
# --- END STEP 4 ---
# --- STEP 5: Blocked partner-user combos ---
blocked_partner_user = set()  # (partner_id, user_id)
# --- END STEP 5 ---

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
    user_id = data.get('user_id')
    if not content or not partner_id or not user_id:
        log_access(request, "/generate_watermark", 400)
        return jsonify({"error": "Missing content, partner_id, or user_id"}), 400
    # Consent check
    if not consent_state.get(user_id, {}).get("watermark", True):
        return jsonify({"error": "Consent denied for watermarking"}), 403
    hash_value = generate_watermark(content, partner_id)
    log_access(request, "/generate_watermark", 200)
    return jsonify({"watermark": hash_value})

@app.route('/generate_honeytoken', methods=['GET'])
def api_generate_honeytoken():
    if not check_api_key(request):
        log_access(request, "/generate_honeytoken", 401)
        return jsonify({"error": "Unauthorized"}), 401
    partner_id = request.args.get('partner_id') or request.headers.get('X-Partner-Id')
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({"error": "Missing user_id"}), 400
    # Consent check
    if not consent_state.get(user_id, {}).get("honeytoken", True):
        return jsonify({"error": "Consent denied for honeytoken"}), 403
    token = generate_honeytoken()
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
    user_id = data.get('user_id')
    if not purpose or days_valid is None or not region or not user_id:
        log_access(request, "/generate_policy", 400)
        return jsonify({"error": "Missing purpose, days_valid, region, or user_id"}), 400
    # Consent check
    if not consent_state.get(user_id, {}).get("policy", True):
        return jsonify({"error": "Consent denied for policy"}), 403
    try:
        days_valid = int(days_valid)
    except ValueError:
        log_access(request, "/generate_policy", 400)
        return jsonify({"error": "days_valid must be an integer"}), 400
    policy = generate_policy(purpose, days_valid, region)
    # Update user's expiry_date
    consent_state[user_id]["expiry_date"] = policy["expiry_date"]
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
    user_id = request.args.get('user_id')
    log_access(request, "/user_notifications", 200)
    if user_id:
        filtered = [n for n in user_notifications if n['user'] == user_id]
        return jsonify(filtered), 200
    return jsonify(user_notifications), 200

# --- STEP 1: Consent Endpoints ---
@app.route('/get_consent/<user_id>', methods=['GET'])
def get_consent(user_id):
    consent = consent_state.get(user_id)
    if consent is None:
        return jsonify({"error": "User not found"}), 404
    return jsonify(consent), 200

@app.route('/update_consent/<user_id>', methods=['POST'])
def update_consent(user_id):
    data = request.get_json()
    if user_id not in consent_state:
        return jsonify({"error": "User not found"}), 404
    consent_state[user_id].update(data)
    return jsonify(consent_state[user_id]), 200
# --- END STEP 1 ---

# --- STEP 2: Multi-user partner data request ---
@app.route('/partner_request_data', methods=['POST'])
def partner_request_data():
    if not check_api_key(request):
        log_access(request, "/partner_request_data", 401)
        return jsonify({"error": "Unauthorized"}), 401
    data = request.get_json()
    partner_id = data.get('partner_id')
    region = data.get('region')
    requested_users = data.get('requested_users', [])
    purpose = data.get('purpose')
    if not partner_id or not region or not requested_users:
        return jsonify({"error": "Missing partner_id, region, or requested_users"}), 400
    # --- Trap Detection: Check if partner is using honeytokens ---
    trap_triggered = detect_trap_usage(partner_id, data)
    response = {}
    
    # --- Log access for each requested user ---
    for user_id in requested_users:
        user_access_history.append({
            "partner": partner_id,
            "user": user_id,
            "timestamp": datetime.utcnow().isoformat(),
            "ip": request.remote_addr,
            "trap_triggered": trap_triggered,
            "purpose": purpose,
            "region": region
        })
    
    # --- Deception Mode: Return synthetic data if active ---
    if deception_state.get(partner_id):
        for user_id in requested_users:
            # Simulate delay
            sleep(randint(1, 2))
            fake = generate_synthetic_data(partner_id)
            for field, value in fake.items():
                detailed_access_log.append({
                    "partner": partner_id,
                    "user": user_id,
                    "field": field,
                    "value": value,
                    "timestamp": datetime.utcnow().isoformat(),
                    "source": "synthetic"
                })
            response[user_id] = {**fake, "source": "synthetic"}
        log_access(request, "/partner_request_data", 200)
        return jsonify(response), 200
    # --- Normal logic below ---
    for user_id in requested_users:
        if partner_id in restricted_partners and user_id in restricted_partners[partner_id]:
            response[user_id] = {"status": "denied", "reason": "Access permanently revoked due to misuse"}
            continue
        consent = consent_state.get(user_id)
        if not consent:
            response[user_id] = {"status": "denied", "reason": "User not found"}
            continue
        if not consent.get("policy", True):
            response[user_id] = {"status": "denied", "reason": "Consent revoked for policy"}
            continue
        if not consent.get("watermark", True):
            response[user_id] = {"status": "denied", "reason": "Consent revoked for watermark"}
            continue
        if not consent.get("honeytoken", True):
            response[user_id] = {"status": "denied", "reason": "Consent revoked for honeytoken"}
            continue
        expiry = consent.get("expiry_date", "2099-12-31")
        if date.today().isoformat() > expiry:
            response[user_id] = {"status": "denied", "reason": "Policy expired"}
            continue
        if region != last_policy.get("geo_restriction", "IN"):
            update_risk_score(partner_id, "region_mismatch", user_id)
            response[user_id] = {"status": "denied", "reason": "Region mismatch"}
            continue
        update_risk_score(partner_id, "high_frequency", user_id)
        update_risk_score(partner_id, "late_access", user_id)
        if partner_id in restricted_partners and user_id in restricted_partners[partner_id]:
            response[user_id] = {"status": "denied", "reason": "Access permanently revoked due to misuse"}
            continue
        # Log real data access
        detailed_access_log.append({
            "partner": partner_id,
            "user": user_id,
            "field": "all",
            "value": "real_data",
            "timestamp": datetime.utcnow().isoformat(),
            "source": "real"
        })
        response[user_id] = {"status": "granted", "expiry": expiry}
        if response[user_id]["status"] == "granted":
            risk_score = partner_scores.get(partner_id, 0)
            # Enhanced notification system with threat levels
            if risk_score >= 80 or deception_state.get(partner_id) or partner_id in restricted_partners:
                # RED notification - High threat level
                user_notifications.append({
                    "user": user_id,
                    "partner": partner_id,
                    "type": "high_risk",
                    "level": "threat",  # Red notification
                    "timestamp": datetime.utcnow().isoformat(),
                    "message": f"🚨 THREAT ALERT: Partner {partner_id} accessed your data! Risk score: {risk_score}",
                    "risk": risk_score,
                    "can_escalate": True,  # User can request admin action
                    "escalation_reason": f"High risk partner ({risk_score}) accessing data"
                })
            elif risk_score >= 50:
                # YELLOW notification - Medium risk
                user_notifications.append({
                    "user": user_id,
                    "partner": partner_id,
                    "type": "medium_risk",
                    "level": "warning",  # Yellow notification
                    "timestamp": datetime.utcnow().isoformat(),
                    "message": f"⚠️ WARNING: Partner {partner_id} accessed your data. Risk score: {risk_score}",
                    "risk": risk_score,
                    "can_escalate": True,
                    "escalation_reason": f"Medium risk partner ({risk_score}) accessing data"
                })
            else:
                # GREEN notification - Normal access
                user_notifications.append({
                    "user": user_id,
                    "partner": partner_id,
                    "type": "access",
                    "level": "normal",  # Green notification
                    "timestamp": datetime.utcnow().isoformat(),
                    "message": f"✅ Normal access: Partner {partner_id} accessed your data.",
                    "risk": risk_score,
                    "can_escalate": False
                })
    log_access(request, "/partner_request_data", 200)
    return jsonify(response), 200
# --- END STEP 2 ---

# --- STEP 3: Simulate Honeytoken Trap Hit + Log It ---
@app.route('/simulate_trap_hit', methods=['POST'])
def simulate_trap_hit():
    data = request.get_json()
    partner_id = data.get('partner_id')
    user_id = data.get('user_id')
    if not partner_id or not user_id:
        return jsonify({"error": "Missing partner_id or user_id"}), 400
    trap_hit = random.random() < 0.3
    if trap_hit:
        score = update_risk_score(partner_id, "trap", user_id)
        trap_logs.append({
            "partner": partner_id,
            "user": user_id,
            "timestamp": datetime.utcnow().isoformat(),
            "ip": request.remote_addr,
            "trigger": "honeytoken",
            "risk_score": score
        })
        # Notify the user
        user_notifications.append({
            "user": user_id,
            "partner": partner_id,
            "type": "trap_hit",
            "level": "threat",  # Red notification for trap hits
            "timestamp": datetime.utcnow().isoformat(),
            "message": f"🚨 TRAP ALERT: Partner {partner_id} triggered a security trap on your data! Risk score: {score}",
            "risk": score,
            "can_escalate": True,  # User can request admin action
            "escalation_reason": f"Trap triggered by partner {partner_id}"
        })
        return jsonify({"trap_hit": True, "risk_score": score})
    else:
        score = update_risk_score(partner_id, "high_frequency", user_id)
        return jsonify({"trap_hit": False, "risk_score": score})
# --- END STEP 3 ---

# --- STEP 4: Risk Scoring System ---
@app.route('/get_risk_score/<partner_id>', methods=['GET'])
def get_risk_score(partner_id):
    score = partner_scores.get(partner_id, 0)
    return jsonify({"partner_id": partner_id, "score": score}), 200
# --- END STEP 4 ---

# --- STEP 5: Alert System & Admin Restriction Flow ---
@app.route('/alerts/<user_id>', methods=['GET'])
def get_alerts(user_id):
    if user_id == "admin":
        return jsonify(alerts), 200
    user_alerts = [a for a in alerts if a.get("user") == user_id or a.get("to") == user_id]
    return jsonify(user_alerts), 200

@app.route('/request_restriction', methods=['POST'])
def request_restriction():
    data = request.get_json()
    partner_id = data.get('partner_id')
    user_id = data.get('user_id')
    if not partner_id or not user_id:
        return jsonify({"error": "Missing partner_id or user_id"}), 400
    restriction_requests.append({"partner_id": partner_id, "user_id": user_id, "timestamp": datetime.now(UTC).isoformat()})
    alerts.append({
        "user": user_id,
        "partner": partner_id,
        "risk_score": partner_scores.get(partner_id, 0),
        "message": f"User {user_id} requested restriction for {partner_id}"
    })
    return jsonify({"status": "Restriction requested"}), 200

@app.route('/pending_restrictions', methods=['GET'])
def pending_restrictions():
    return jsonify(restriction_requests), 200

@app.route('/restrict_access', methods=['POST'])
def restrict_access():
    data = request.get_json()
    partner_id = data.get('partner_id')
    user_id = data.get('user_id')
    action = data.get('action', 'block')  # 'block' or 'expire'
    if not partner_id or not user_id:
        return jsonify({"error": "Missing partner_id or user_id"}), 400
    if action == 'block':
        # Add to restricted_partners
        if partner_id not in restricted_partners:
            restricted_partners[partner_id] = set()
        restricted_partners[partner_id].add(user_id)
        blocked_partner_user.add((partner_id, user_id))
        alerts.append({
            "user": user_id,
            "partner": partner_id,
            "risk_score": partner_scores.get(partner_id, 0),
            "message": f"Admin blocked {partner_id} for {user_id}"
        })
    elif action == 'expire':
        if user_id in consent_state:
            consent_state[user_id]["expiry_date"] = date.today().isoformat()
    alerts.append({
                "user": user_id,
        "partner": partner_id,
                "risk_score": partner_scores.get(partner_id, 0),
                "message": f"Admin set expiry for {partner_id} and {user_id}"
            })
    return jsonify({"status": f"Restriction applied for {partner_id} and {user_id}"}), 200
# --- END STEP 5 ---

# --- New endpoints for admin/forensics ---
@app.route('/risk_score/<partner_id>', methods=['GET'])
def get_risk_score_traits(partner_id):
    score = partner_scores.get(partner_id, 0)
    traits = list(partner_traits.get(partner_id, []))
    return jsonify({"partner_id": partner_id, "score": score, "traits": traits}), 200

@app.route('/trap_logs', methods=['GET'])
def get_trap_logs():
    return jsonify(trap_logs), 200

@app.route('/restricted_partners', methods=['GET'])
def get_restricted_partners():
    # Return as {partner_id: [user_id, ...]}
    return jsonify({k: list(v) for k, v in restricted_partners.items()}), 200

@app.route('/partner_traits/<partner_id>', methods=['GET'])
def get_partner_traits(partner_id):
    traits = list(partner_traits.get(partner_id, []))
    return jsonify({"partner_id": partner_id, "traits": traits}), 200

# --- Admin endpoints for deception/field logs and alerts ---
@app.route('/deception_logs', methods=['GET'])
def get_deception_logs():
    return jsonify(detailed_access_log), 200

@app.route('/alert_logs', methods=['GET'])
def get_alert_logs():
    return jsonify(alert_log), 200

@app.route('/trap_impact_logs', methods=['GET'])
def get_trap_impact_logs():
    return jsonify(trap_impact_log), 200

# --- NEW: User Access History Tracker Endpoint ---
@app.route('/user_access_history/<user_id>', methods=['GET'])
def get_user_access_history(user_id):
    if not check_api_key(request):
        log_access(request, "/user_access_history", 401)
        return jsonify({"error": "Unauthorized"}), 401
    
    # Filter logs for the specific user
    user_logs = [log for log in user_access_history if log["user"] == user_id]
    log_access(request, "/user_access_history", 200)
    return jsonify(user_logs), 200
# --- END NEW ---

# --- Document Trap Injection ---
known_honeytokens = {}  # trap_value: {type, created_at, partner_id}

def detect_trap_usage(partner_id, data):
    """Detect if partner is using any known honeytokens"""
    if isinstance(data, str):
        for trap_value in known_honeytokens:
            if trap_value in data:
                # Mark trap as used by this partner
                known_honeytokens[trap_value]["partner_id"] = partner_id
                # Trigger trap hit
                update_risk_score(partner_id, "trap", None)
                return True
    elif isinstance(data, dict):
        for value in data.values():
            if detect_trap_usage(partner_id, str(value)):
                return True
    return False

@app.route('/trap_inject', methods=['POST'])
def trap_inject():
    if not check_api_key(request):
        log_access(request, "/trap_inject", 401)
        return jsonify({"error": "Unauthorized"}), 401
    data = request.get_json()
    document = data.get('document')
    trap_type = data.get('trap_type', 'email')
    if not document:
        return jsonify({"error": "Missing document"}), 400
    # Generate trap value based on type
    if trap_type == 'email':
        trap_value = f"trap_{uuid4().hex[:8]}@honeytoken.org"
        pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    elif trap_type == 'phone':
        trap_value = f"+1-555-{uuid4().hex[:3]}-{uuid4().hex[:4]}"
        pattern = r'\+?[\d\s\-\(\)]{10,}'
    elif trap_type == 'name':
        trap_value = f"John {uuid4().hex[:6]}"
        pattern = r'\b[A-Z][a-z]+ [A-Z][a-z]+\b'
    elif trap_type == 'id':
        trap_value = f"ID{uuid4().hex[:8].upper()}"
        pattern = r'\b\d{5,}\b'
    else:
        return jsonify({"error": "Invalid trap type"}), 400
    # Replace sensitive values with trap
    redacted_document = re.sub(pattern, trap_value, document)
    # Store trap for future detection
    known_honeytokens[trap_value] = {
        "type": trap_type,
        "created_at": datetime.utcnow().isoformat(),
        "partner_id": None  # Will be set when trap is hit
    }
    log_access(request, "/trap_inject", 200)
    return jsonify({
        "redacted_document": redacted_document,
        "trap_value": trap_value,
        "trap_type": trap_type
    }), 200
# --- END Document Trap Injection ---

@app.route('/known_honeytokens', methods=['GET'])
def get_known_honeytokens():
    return jsonify(known_honeytokens), 200

@app.route('/test_trap_value', methods=['POST'])
def test_trap_value():
    if not check_api_key(request):
        return jsonify({"error": "Unauthorized"}), 401
    data = request.get_json()
    partner_id = data.get('partner_id')
    value = data.get('value')
    if not partner_id or not value:
        return jsonify({"error": "Missing partner_id or value"}), 400
    hit = detect_trap_usage(partner_id, value)
    if hit:
        return jsonify({"result": f"Trap hit detected for {partner_id}!"}), 200
    else:
        return jsonify({"result": "No trap detected."}), 200

# --- User escalation: request admin action on partner ---
@app.route('/request_admin_action', methods=['POST'])
def request_admin_action():
    data = request.get_json()
    user_id = data.get('user_id')
    partner_id = data.get('partner_id')
    reason = data.get('reason', 'Trap triggered')
    notification_id = data.get('notification_id')  # Optional: specific notification that triggered escalation
    
    # Create detailed escalation alert
    escalation_alert = {
        "user": user_id,
            "partner": partner_id,
        "type": "user_escalation",
        "timestamp": datetime.utcnow().isoformat(),
        "message": f"🚨 ESCALATION: User {user_id} requests admin action on {partner_id}",
        "reason": reason,
        "notification_id": notification_id,
        "partner_risk_score": partner_scores.get(partner_id, 0),
        "partner_traits": list(partner_traits.get(partner_id, [])),
        "user_consent_state": consent_state.get(user_id, {}),
        "status": "pending"  # pending, reviewed, actioned
    }
    
    alerts.append(escalation_alert)
    
    # Also add to restriction requests for admin review
    restriction_requests.append({
        "partner_id": partner_id, 
        "user_id": user_id, 
        "timestamp": datetime.now(UTC).isoformat(),
        "source": "user_escalation",
        "reason": reason
    })
    
    return jsonify({
        "status": "Escalation sent to admin",
        "alert_id": len(alerts) - 1,
        "message": f"Your request for admin action on {partner_id} has been sent and is under review."
    }), 200

@app.route('/activate_deception/<partner_id>', methods=['POST'])
def activate_deception(partner_id):
    from risk_engine import deception_state
    deception_state[partner_id] = True
    return jsonify({"status": "deception mode activated for partner", "partner_id": partner_id}), 200

@app.route('/user_trap_logs/<user_id>', methods=['GET'])
def get_user_trap_logs(user_id):
    log_access(request, "/user_trap_logs", 200)
    user_traps = [t for t in trap_logs if t.get('user') == user_id]
    return jsonify(user_traps), 200

@app.route('/user_restricted_partners/<user_id>', methods=['GET'])
def get_user_restricted_partners(user_id):
    log_access(request, "/user_restricted_partners", 200)
    # Handle case where restricted_partners might be empty or not a dict
    if not restricted_partners or not isinstance(restricted_partners, dict):
        return jsonify([]), 200
    restricted = [p for p, users in restricted_partners.items() if user_id in users]
    return jsonify(restricted), 200

# --- Enhanced Admin Endpoints for Better Monitoring ---
@app.route('/admin/trap_logs', methods=['GET'])
def get_admin_trap_logs():
    """Enhanced trap logs for admin with detailed information"""
    if not check_api_key(request):
        return jsonify({"error": "Unauthorized"}), 401
    
    enhanced_traps = []
    for trap in trap_logs:
        enhanced_trap = {
            **trap,
            "partner_risk_score": partner_scores.get(trap.get('partner', ''), 0),
            "partner_traits": list(partner_traits.get(trap.get('partner', ''), [])),
            "is_restricted": trap.get('partner') in restricted_partners,
            "trap_hit_count": trap_hits.get(trap.get('partner', ''), 0)
        }
        enhanced_traps.append(enhanced_trap)
    
    return jsonify(enhanced_traps), 200

@app.route('/admin/restricted_partners_detailed', methods=['GET'])
def get_admin_restricted_partners_detailed():
    """Detailed restricted partners information for admin"""
    if not check_api_key(request):
        return jsonify({"error": "Unauthorized"}), 401
    
    detailed_restrictions = []
    for partner_id, users in restricted_partners.items():
        for user_id in users:
            detailed_restrictions.append({
                "partner_id": partner_id,
                "user_id": user_id,
                "risk_score": partner_scores.get(partner_id, 0),
                "traits": list(partner_traits.get(partner_id, [])),
                "trap_hits": trap_hits.get(partner_id, 0),
                "restriction_reason": "Multiple trap hits or high risk score"
            })
    
    return jsonify(detailed_restrictions), 200

@app.route('/admin/partner_activity_summary', methods=['GET'])
def get_admin_partner_activity_summary():
    """Summary of all partner activity for admin dashboard"""
    if not check_api_key(request):
        return jsonify({"error": "Unauthorized"}), 401
    
    partner_summary = {}
    
    # Get all unique partners from various logs
    all_partners = set()
    for log in user_access_history:
        all_partners.add(log.get('partner'))
    for trap in trap_logs:
        all_partners.add(trap.get('partner'))
    for log in detailed_access_log:
        all_partners.add(log.get('partner'))
    
    for partner_id in all_partners:
        if partner_id:
            # Count access attempts
            access_count = len([log for log in user_access_history if log.get('partner') == partner_id])
            # Count trap hits
            trap_count = len([trap for trap in trap_logs if trap.get('partner') == partner_id])
            # Count restricted users
            restricted_users = list(restricted_partners.get(partner_id, []))
            
            partner_summary[partner_id] = {
                "risk_score": partner_scores.get(partner_id, 0),
                "traits": list(partner_traits.get(partner_id, [])),
                "access_attempts": access_count,
                "trap_hits": trap_count,
                "restricted_users": restricted_users,
                "is_restricted": partner_id in restricted_partners,
                "deception_active": deception_state.get(partner_id, False)
            }
    
    return jsonify(partner_summary), 200

@app.route('/admin/user_activity_summary', methods=['GET'])
def get_admin_user_activity_summary():
    """Summary of all user activity for admin dashboard"""
    if not check_api_key(request):
        return jsonify({"error": "Unauthorized"}), 401
    
    user_summary = {}
    
    for user_id in consent_state.keys():
        # Count notifications
        notification_count = len([n for n in user_notifications if n.get('user') == user_id])
        # Count threat notifications
        threat_count = len([n for n in user_notifications if n.get('user') == user_id and n.get('level') == 'threat'])
        # Count access history
        access_count = len([log for log in user_access_history if log.get('user') == user_id])
        # Get restricted partners for this user
        user_restricted = [p for p, users in restricted_partners.items() if user_id in users]
        
        user_summary[user_id] = {
            "consent_state": consent_state.get(user_id, {}),
            "total_notifications": notification_count,
            "threat_notifications": threat_count,
            "access_attempts": access_count,
            "restricted_partners": user_restricted,
            "last_access": None
        }
        
        # Get last access time
        user_accesses = [log for log in user_access_history if log.get('user') == user_id]
        if user_accesses:
            user_summary[user_id]["last_access"] = max(user_accesses, key=lambda x: x.get('timestamp', '')).get('timestamp')
    
    return jsonify(user_summary), 200

# --- Bulk Partner Data Request for Multiple Partners/Users ---
@app.route('/bulk_partner_request', methods=['POST'])
def bulk_partner_request():
    """Handle multiple partners requesting data from multiple users efficiently"""
    if not check_api_key(request):
        log_access(request, "/bulk_partner_request", 401)
        return jsonify({"error": "Unauthorized"}), 401
    
    data = request.get_json()
    requests_list = data.get('requests', [])  # List of {partner_id, users, region, purpose}
    
    if not requests_list:
        return jsonify({"error": "No requests provided"}), 400
    
    bulk_response = {}
    
    for req in requests_list:
        partner_id = req.get('partner_id')
        requested_users = req.get('users', [])
        region = req.get('region', 'IN')
        purpose = req.get('purpose', 'bulk_request')
        
        if not partner_id or not requested_users:
            continue
            
        # Process each partner's request
        partner_response = {}
        
        # Check for trap usage
        trap_triggered = detect_trap_usage(partner_id, req)
        
        # Log access for each requested user
        for user_id in requested_users:
            user_access_history.append({
                "partner": partner_id,
                "user": user_id,
                "timestamp": datetime.utcnow().isoformat(),
                "ip": request.remote_addr,
                "trap_triggered": trap_triggered,
                "purpose": purpose,
                "region": region,
                "request_type": "bulk"
            })
        
        # Process each user for this partner
        for user_id in requested_users:
            # Check restrictions
            if partner_id in restricted_partners and user_id in restricted_partners[partner_id]:
                partner_response[user_id] = {"status": "denied", "reason": "Access permanently revoked due to misuse"}
                continue
                
            # Check consent
            consent = consent_state.get(user_id)
            if not consent:
                partner_response[user_id] = {"status": "denied", "reason": "User not found"}
                continue
            if not consent.get("policy", True):
                partner_response[user_id] = {"status": "denied", "reason": "Consent revoked for policy"}
                continue
            if not consent.get("watermark", True):
                partner_response[user_id] = {"status": "denied", "reason": "Consent revoked for watermark"}
                continue
            if not consent.get("honeytoken", True):
                partner_response[user_id] = {"status": "denied", "reason": "Consent revoked for honeytoken"}
                continue
                
            # Check expiry
            expiry = consent.get("expiry_date", "2099-12-31")
            if date.today().isoformat() > expiry:
                partner_response[user_id] = {"status": "denied", "reason": "Policy expired"}
                continue
                
            # Check region
            if region != last_policy.get("geo_restriction", "IN"):
                update_risk_score(partner_id, "region_mismatch", user_id)
                partner_response[user_id] = {"status": "denied", "reason": "Region mismatch"}
                continue
                
            # Update risk scores
            update_risk_score(partner_id, "high_frequency", user_id)
            update_risk_score(partner_id, "late_access", user_id)
            
            # Final restriction check
            if partner_id in restricted_partners and user_id in restricted_partners[partner_id]:
                partner_response[user_id] = {"status": "denied", "reason": "Access permanently revoked due to misuse"}
                continue
                
            # Grant access and create notifications
            detailed_access_log.append({
                "partner": partner_id,
                "user": user_id,
                "field": "all",
                "value": "real_data",
                "timestamp": datetime.utcnow().isoformat(),
                "source": "real",
                "request_type": "bulk"
            })
            
            partner_response[user_id] = {"status": "granted", "expiry": expiry}
            
            # Create notifications with threat levels
            if partner_response[user_id]["status"] == "granted":
                risk_score = partner_scores.get(partner_id, 0)
                if risk_score >= 80 or deception_state.get(partner_id) or partner_id in restricted_partners:
                    user_notifications.append({
                        "user": user_id,
                        "partner": partner_id,
                        "type": "high_risk",
                        "level": "threat",
                        "timestamp": datetime.utcnow().isoformat(),
                        "message": f"🚨 THREAT ALERT: Partner {partner_id} accessed your data! Risk score: {risk_score}",
                        "risk": risk_score,
                        "can_escalate": True,
                        "escalation_reason": f"High risk partner ({risk_score}) accessing data",
                        "request_type": "bulk"
                    })
                elif risk_score >= 50:
                    user_notifications.append({
                        "user": user_id,
                        "partner": partner_id,
                        "type": "medium_risk",
                        "level": "warning",
                        "timestamp": datetime.utcnow().isoformat(),
                        "message": f"⚠️ WARNING: Partner {partner_id} accessed your data. Risk score: {risk_score}",
                        "risk": risk_score,
                        "can_escalate": True,
                        "escalation_reason": f"Medium risk partner ({risk_score}) accessing data",
                        "request_type": "bulk"
                    })
                else:
                    user_notifications.append({
                        "user": user_id,
                        "partner": partner_id,
                        "type": "access",
                        "level": "normal",
                        "timestamp": datetime.utcnow().isoformat(),
                        "message": f"✅ Normal access: Partner {partner_id} accessed your data.",
                        "risk": risk_score,
                        "can_escalate": False,
                        "request_type": "bulk"
                    })
        
        bulk_response[partner_id] = partner_response
    
    log_access(request, "/bulk_partner_request", 200)
    return jsonify(bulk_response), 200

if __name__ == '__main__':
    app.run(port=5000, debug=True) 