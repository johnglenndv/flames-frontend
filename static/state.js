// state.js

export const appState = {
    nodes: {},
    selectedNodeId: null,
    nodeMarkers: {}
};

// 🔥 CALLED WHEN A MARKER IS CLICKED
export function selectNode(nodeId) {
    appState.selectedNodeId = nodeId;

    const node = appState.nodes[nodeId];
    if (!node) return;

    updateNodeStatus(node);
}

// 🔥 UPDATE NODE STATUS PANEL
function updateNodeStatus(node) {
    document.getElementById("node-id").textContent = node.node;
    document.getElementById("node-temp").textContent = node.temp ?? "-";
    document.getElementById("node-hum").textContent = node.hum ?? "-";
    document.getElementById("node-smoke").textContent = node.smoke ?? "-";
    document.getElementById("node-flame").textContent = node.flame ? "YES" : "NO";

    if (node.received_at) {
        const d = new Date(node.received_at);
        document.getElementById("node-date").textContent = d.toLocaleDateString();
        document.getElementById("node-time").textContent = d.toLocaleTimeString();
    }
}
