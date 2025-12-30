// ================================
// CONFIG
// ================================
const API_BASE = "https://flames-backend-hbu0.onrender.com";
const WS_URL = "wss://flames-backend-hbu0.onrender.com/ws";

const GATEWAY_LAT = 16.046962;
const GATEWAY_LON = 120.342117;

// ================================
// STATE
// ================================
const appState = {
  nodes: {},
  incidents: [],
  selectedNodeId: null,
  network: { total: 0, online: 0, offline: 0 }
};

const nodeMarkers = {}; // nodeId → marker

// ================================
// MAP INIT
// ================================
const map = L.map("flames-map", { zoomControl: false })
  .setView([GATEWAY_LAT, GATEWAY_LON], 12);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 25,
  attribution: "© OpenStreetMap contributors"
}).addTo(map);

// ================================
// ICONS
// ================================
const nodeIcon = L.icon({
  iconUrl: "/icons/Node.png",
  iconSize: [50, 50],
  iconAnchor: [17, 35],
  popupAnchor: [0, -35]
});

// ================================
// GATEWAY MARKER (RESTORED)
// ================================
const gatewayIcon = L.icon({
  iconUrl: "/icons/Gateway.png",
  iconSize: [50, 50],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40]
});

const gatewayMarker = L.marker(
  [GATEWAY_LAT, GATEWAY_LON],
  {
    icon: gatewayIcon,
    zIndexOffset: 1000 // 👈 ensures it stays visible
  }
)
  .addTo(map)
  .bindPopup("PHINMA Upang (F.L.A.M.E.S. Gateway)");

gatewayMarker.on("mouseover", () => gatewayMarker.openPopup());
gatewayMarker.on("mouseout", () => gatewayMarker.closePopup());


// ================================
// NODE MARKERS
// ================================
function addNodeMarker(node) {
  if (node.lat == null || node.lon == null) return;

  const marker = L.marker([node.lat, node.lon], { icon: nodeIcon })
    .addTo(map)
    .bindPopup(`Node: ${node.node}`);

  marker.on("click", () => {
    appState.selectedNodeId = node.node;
    updateNodeStatus(node);
    map.flyTo([node.lat, node.lon], 18);
  });

  nodeMarkers[node.node] = marker;
}

function updateNodeMarker(node) {
  if (!nodeMarkers[node.node]) return;
  if (node.lat == null || node.lon == null) return;

  nodeMarkers[node.node].setLatLng([node.lat, node.lon]);
}

// ================================
// NODE STATUS PANEL
// ================================
function updateNodeStatus(node) {
  const box = document.getElementById("status-content");
  if (!box) return;

  box.innerHTML = `
  <div id="status-content">
    <p><strong>Node ID:</strong> ${node.node}</p>
    <p><strong>Temperature:</strong> ${node.temp} °C</p>
    <p><strong>Humidity:</strong> ${node.hum} %</p>
    <p><strong>Smoke:</strong> ${node.smoke}</p>
    <p><strong>Flame:</strong> ${node.flame ? "YES" : "NO"}</p>
    <small>Last update: ${node.received_at}</small>
  <div>
  `;
}

// ================================
// INCIDENTS
// ================================
function renderIncidents() {
  const box = document.getElementById("incidentList");
  const count = document.getElementById("incident-count");

  box.innerHTML = "";

  if (appState.incidents.length === 0) {
    box.innerHTML = "<p>No active incidents.</p>";
    count.innerText = "0";
    return;
  }

  count.innerText = appState.incidents.length;

  appState.incidents.forEach(i => {
    box.innerHTML += `
      <div class="incident-card">
        <div class="incident-title">${i.node}</div>
        <small>${i.timestamp}</small>
      </div>
    `;
  });
}

// ================================
// NETWORK STATUS
// ================================
function updateNetworkStatus() {
  const nodes = Object.values(appState.nodes);

  const online = nodes.filter(n => {
    const last = new Date(n.received_at);
    return Date.now() - last.getTime() < 30000;
  }).length;

  document.getElementById("networkBox").innerHTML = `
    <div class="network-status-header">Network Status</div>
    <p>Total: ${nodes.length}</p>
    <p>Online: ${online}</p>
    <p>Offline: ${nodes.length - online}</p>
  `;
}

// ================================
// INITIAL LOAD (THIS WAS MISSING ❌)
// ================================
async function loadInitialData() {
  // Load nodes
  const res = await fetch(`${API_BASE}/nodes`);
  appState.nodes = await res.json();

  Object.values(appState.nodes).forEach(addNodeMarker);
  updateNetworkStatus();

  // Load incidents
  const inc = await fetch(`${API_BASE}/incidents`);
  appState.incidents = await inc.json();
  renderIncidents();
}

loadInitialData();

// ================================
// WEBSOCKET (FIXED)
// ================================
const ws = new WebSocket(WS_URL);

ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);

  if (msg.type === "node_update") {
    const node = msg.data;
    appState.nodes[node.node] = node;

    if (!nodeMarkers[node.node]) {
      addNodeMarker(node);
    } else {
      updateNodeMarker(node);
    }

    updateNetworkStatus();

    if (appState.selectedNodeId === node.node) {
      updateNodeStatus(node);
    }
  }

  if (msg.type === "incident") {
    appState.incidents.unshift(msg.data);
    renderIncidents();
  }
};
