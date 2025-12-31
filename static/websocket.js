import { appState } from "./state.js";
import { addNodeMarker, updateNodeMarker } from "./map.js";

export function connectWebSocket() {
  const ws = new WebSocket(
    (location.protocol === "https:" ? "wss://" : "ws://") +
    location.host +
    "/ws"
  );

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);

    if (msg.type !== "node_update") return;

    const node = msg.data;
    appState.nodes[node.node] = node;

    if (!window.nodeMarkers?.[node.node]) {
      addNodeMarker(node);
    } else {
      updateNodeMarker(node);
    }
  };

  ws.onopen = () => console.log("✅ WebSocket connected");
  ws.onerror = e => console.error("❌ WS error", e);
}
