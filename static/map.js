// map.js
import { selectNode } from "./state.js";

let map;
export const nodeMarkers = {};

// 🔥 INIT MAP (EXPORTED)
export function initMap() {
    map = L.map("flames-map", { zoomControl: false })
        .setView([16.043, 120.333], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors"
    }).addTo(map);

    console.log("🗺️ Map initialized");
}

// 🔥 ADD MARKER (EXPORTED)
export function addNodeMarker(node) {
    if (!node.lat || !node.lon) return;

    const marker = L.marker([node.lat, node.lon])
        .addTo(map)
        .on("click", () => selectNode(node.node));

    nodeMarkers[node.node] = marker;
}

// 🔥 UPDATE MARKER (EXPORTED)
export function updateNodeMarker(node) {
    const marker = nodeMarkers[node.node];
    if (!marker || !node.lat || !node.lon) return;

    marker.setLatLng([node.lat, node.lon]);
}
