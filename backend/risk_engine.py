from datetime import datetime, UTC

# Suspicious hours (e.g., 0-6 AM)
suspicious_hours = set(range(0, 7))
partner_scores = {}
partner_access_times = {}
partner_trap_counts = {}  # partner_id: count
partner_traits = {}  # partner_id: [traits]
restricted_partners = {}  # partner_id: [user_id, ...]
# --- Deception Engine State ---
deception_state = {}  # partner_id: bool
detailed_access_log = []  # field-level logs
alert_log = []  # admin alerts
trap_hits = {}  # partner_id: int
trap_impact_log = []  # for escalation/forensics

# --- Deception Mode Activation ---
def activate_deception_mode(partner_id):
    if not deception_state.get(partner_id):
        deception_state[partner_id] = True
        alert_log.append({
            "partner": partner_id,
            "event": "deception_mode_activated",
            "timestamp": datetime.now(UTC).isoformat()
        })

# Adaptive risk scoring and trait assignment

def update_risk_score(partner_id, reason, user_id=None):
    score = 0
    trait = None
    now = datetime.now(UTC)
    hour = now.hour
    # Frequency tracking
    if partner_id not in partner_access_times:
        partner_access_times[partner_id] = []
    partner_access_times[partner_id].append(now)
    partner_access_times[partner_id] = [t for t in partner_access_times[partner_id] if (now-t).total_seconds() < 600]
    freq = len(partner_access_times[partner_id])
    # Trap count
    if partner_id not in partner_trap_counts:
        partner_trap_counts[partner_id] = 0
    # Scoring logic
    if reason == "trap":
        score = 80
        partner_trap_counts[partner_id] += 1
        trait = "reckless"
        # Track trap hits for escalation
        trap_hits[partner_id] = trap_hits.get(partner_id, 0) + 1
        trap_impact_log.append({
            "partner": partner_id,
            "user": user_id,
            "timestamp": now.isoformat(),
            "event": "trap_hit",
            "trap_hits": trap_hits[partner_id]
        })
        if trap_hits[partner_id] >= 3:
            if partner_id not in restricted_partners:
                restricted_partners[partner_id] = set()
            if user_id:
                restricted_partners[partner_id].add(user_id)
            alert_log.append({
                "partner": partner_id,
                "event": "blocked_after_3_trap_hits",
                "timestamp": now.isoformat()
            })
    elif reason == "late_access":
        score = 10
        if hour in suspicious_hours:
            trait = "nocturnal"
    elif reason == "high_frequency":
        score = 10
        if freq > 5:
            trait = "bursty"
    elif reason == "region_mismatch":
        score = 20
    else:
        score = 0
    # Update score
    partner_scores[partner_id] = partner_scores.get(partner_id, 0) + score
    # Assign traits
    if partner_id not in partner_traits:
        partner_traits[partner_id] = set()
    if trait:
        partner_traits[partner_id].add(trait)
    # Stealthy: many accesses, no traps
    if freq > 10 and partner_trap_counts[partner_id] == 0:
        partner_traits[partner_id].add("stealthy")
    # Activate deception mode if risk >= 80
    if partner_scores[partner_id] >= 80:
        activate_deception_mode(partner_id)
    return partner_scores[partner_id]

# For compatibility, keep calculate_risk_score as a wrapper

def calculate_risk_score(partner_id, endpoint, user_id=None):
    if endpoint == "/generate_honeytoken":
        return update_risk_score(partner_id, "trap", user_id)
    now = datetime.now(UTC)
    hour = now.hour
    if hour in suspicious_hours:
        return update_risk_score(partner_id, "late_access", user_id)
    if partner_id in partner_access_times and len(partner_access_times[partner_id]) > 5:
        return update_risk_score(partner_id, "high_frequency", user_id)
    return partner_scores.get(partner_id, 0) 