import { appState } from "./state.js";
import { updateNodeStatus } from "./nodestatus.js";

export const nodeMarkers = {};

export function addNodeMarker(node) {
  const marker = L.marker([node.lat, node.lon]).addTo(window.map);

  marker.on("click", () => {
    appState.selectedNodeId = node.node;
    updateNodeStatus(node);
  });

  nodeMarkers[node.node] = marker;
}

export function updateNodeMarker(node) {
  const marker = nodeMarkers[node.node];
  if (!marker) return;

  marker.setLatLng([node.lat, node.lon]);

  // If selected → live update status
  if (appState.selectedNodeId === node.node) {
    updateNodeStatus(node);
  }
}