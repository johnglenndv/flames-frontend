// static/api.js
const API_BASE = "https://flames-backend-hbu0.onrender.com";

export async function fetchLatestNodes() {
  const res = await fetch(`${API_BASE}/nodes/latest`);
  if (!res.ok) {
    throw new Error("Failed to load nodes");
  }
  return res.json();
}