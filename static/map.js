// =======================
// MAP VARIABLES (top)
// =======================
let map;
let nodeMarkers = {};

// =======================
// MAP INITIALIZER
// =======================
function initMap() {
    map = L.map("flames-map", {
        zoomControl: false
    }).setView([16.043, 120.333], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors"
    }).addTo(map);
}

// =======================
// MARKER HELPERS
// =======================
function addNodeMarker(node) {
    if (!node.lat || !node.lon) return;

    const marker = L.marker([node.lat, node.lon])
        .addTo(map)
        .on("click", () => selectNode(node.node));

    nodeMarkers[node.node] = marker;
}

function updateNodeMarker(node) {
    const marker = nodeMarkers[node.node];
    if (!marker) return;

    marker.setLatLng([node.lat, node.lon]);
}

// =======================
// 🔥 DOM READY (BOTTOM)
// =======================
document.addEventListener("DOMContentLoaded", () => {
    initMap();
});
