// dashboard.js
import { initMap, addNodeMarker, updateNodeMarker } from "./map.js";
import { appState } from "./state.js";
import { connectWebSocket } from "./websocket.js";
import { fetchLatestNodes } from "./api.js";

// 🔥 INITIAL LOAD
async function loadInitialNodes() {
    try {
        const nodes = await fetchLatestNodes();

        Object.values(nodes).forEach(node => {
            appState.nodes[node.node] = node;

            if (!appState.nodeMarkers[node.node]) {
                addNodeMarker(node);
            } else {
                updateNodeMarker(node);
            }
        });

        console.log(`✅ Loaded ${Object.keys(nodes).length} nodes from REST`);
        console.log("Sample node:", Object.values(nodes)[0]);

    } catch (err) {
        console.error("❌ Failed to load initial nodes:", err);
    }
}

// 🔥 DASHBOARD BOOTSTRAP
document.addEventListener("DOMContentLoaded", async () => {
    initMap();              // 🗺️ map first
    await loadInitialNodes(); // 📡 initial REST data
    connectWebSocket();      // 🔴 realtime updates
});
