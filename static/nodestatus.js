import { appState } from "./state.js";

export function updateNodeStatus(node) {
  if (!node) return;

  document.getElementById("node-id").textContent = node.node;
  document.getElementById("temp").textContent = `${node.temp} °C`;
  document.getElementById("hum").textContent = `${node.hum} %`;
  document.getElementById("smoke").textContent = node.smoke;
  document.getElementById("flame").textContent = node.flame ? "YES" : "NO";

  const dt = new Date(node.received_at);
  document.getElementById("date").textContent = dt.toLocaleDateString();
  document.getElementById("time").textContent = dt.toLocaleTimeString();
}
