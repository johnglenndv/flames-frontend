import { getToken } from "./auth.js";

export async function fetchLatestNodes() {
  const res = await fetch("/nodes/latest", {
    headers: {
      Authorization: `Bearer ${getToken()}`
    }
  });

  if (!res.ok) {
    throw new Error("Failed to load nodes");
  }

  return res.json(); // MUST be array
}
