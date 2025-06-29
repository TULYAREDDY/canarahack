const API_KEY = 'SECRET123';
const BASE_URL = 'http://localhost:5000';

export async function getWithAuth(endpoint) {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
      },
    });
    let data = null;
    try {
      data = await res.json();
    } catch {
      data = null;
    }
    return { ok: res.ok, data, status: res.status };
  } catch (err) {
    return { ok: false, data: null, error: err.message || 'Network error' };
  }
}

export async function postWithAuth(endpoint, body) {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
      },
      body: JSON.stringify(body),
    });
    let data = null;
    try {
      data = await res.json();
    } catch {
      data = null;
    }
    return { ok: res.ok, data, status: res.status };
  } catch (err) {
    return { ok: false, data: null, error: err.message || 'Network error' };
  }
}

export async function getConsent(userId) {
  return getWithAuth(`/get_consent/${userId}`);
}

export async function updateConsent(userId, body) {
  return postWithAuth(`/update_consent/${userId}`, body);
}

export async function simulateTrapHit(partnerId, userId) {
  return postWithAuth('/simulate_trap_hit', { partner_id: partnerId, user_id: userId });
}

export async function getRiskScore(partnerId) {
  return getWithAuth(`/get_risk_score/${partnerId}`);
}

export async function getRiskScoreTraits(partnerId) {
  return getWithAuth(`/risk_score/${partnerId}`);
}

export async function getPartnerTraits(partnerId) {
  return getWithAuth(`/partner_traits/${partnerId}`);
}

export async function getTrapLogs() {
  return getWithAuth('/trap_logs');
}

export async function getRestrictedPartners() {
  return getWithAuth('/restricted_partners');
}

export async function getPendingRestrictions() {
  return getWithAuth('/pending_restrictions');
}

export async function restrictAccess(partnerId, userId, action = 'block') {
  return postWithAuth('/restrict_access', { partner_id: partnerId, user_id: userId, action });
}

export async function trapInject(document, trapType) {
  return postWithAuth('/trap_inject', { document, trap_type: trapType });
}

export async function getKnownHoneytokens() {
  return getWithAuth('/known_honeytokens');
}

export async function getUserAccessHistory(userId) {
  return getWithAuth(`/user_access_history/${userId}`);
}

export async function requestAdminAction(userId, partnerId, reason = 'Trap triggered') {
  return postWithAuth('/request_admin_action', { user_id: userId, partner_id: partnerId, reason });
} 