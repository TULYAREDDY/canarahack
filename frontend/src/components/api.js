const API_KEY = 'SECRET123';
const BASE_URL = 'http://localhost:5000';

export async function getWithAuth(endpoint) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY,
    },
  });
  const data = await res.json();
  return { ok: res.ok, data };
}

export async function postWithAuth(endpoint, body) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return { ok: res.ok, data };
} 