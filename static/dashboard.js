import { appState } from "./state.js";
import { fetchLatestNodes } from "./api.js";
import { addNodeMarker } from "./map.js";
import { connectWebSocket } from "./websocket.js";

async function loadInitialNodes() {
  try {
    const nodes = await fetchLatestNodes();

    nodes.forEach(node => {
      appState.nodes[node.node] = node;
      addNodeMarker(node);
    });

    console.log(`✅ Loaded ${nodes.length} nodes from REST`);
    console.log("Sample node:", nodes[0]);

  } catch (err) {
    console.error("❌ Failed to load initial nodes:", err);
  }
}

async function initDashboard() {
  await loadInitialNodes();
  connectWebSocket();
}

initDashboard();
