from datetime import datetime, UTC

# Suspicious hours (e.g., 0-6 AM)
suspicious_hours = set(range(0, 7))
partner_scores = {}
partner_access_times = {}

# Calculate risk score for a partner based on request
# - endpoint: if honeytoken/trap, big penalty
# - time: if in suspicious hours, add
# - frequency: if > threshold in last 10 min, add

def calculate_risk_score(partner_id, endpoint):
    score = partner_scores.get(partner_id, 0)  # Start from previous score
    now = datetime.now(UTC)
    hour = now.hour
    # Track access times for frequency
    if partner_id not in partner_access_times:
        partner_access_times[partner_id] = []
    partner_access_times[partner_id].append(now)
    # Remove accesses older than 10 min
    partner_access_times[partner_id] = [t for t in partner_access_times[partner_id] if (now-t).total_seconds() < 600]
    freq = len(partner_access_times[partner_id])
    # Honeytoken/trap access
    if endpoint == "/generate_honeytoken":
        score += 80
    # Suspicious hours
    if hour in suspicious_hours:
        score += 10
    # High frequency
    if freq > 5:
        score += 10
    # Clamp
    score = min(score, 100)
    partner_scores[partner_id] = score
    return score 