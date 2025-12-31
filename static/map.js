// ================================
// CONFIG
// ================================
const API_BASE = "https://flames-backend-hbu0.onrender.com";
const WS_URL = "wss://flames-backend-hbu0.onrender.com/ws";

const GATEWAY_LAT = 16.046962;
const GATEWAY_LON = 120.342117;

// ================================
// FALLBACK POSITIONS (NO GPS)
// ================================
const fallbackPositions = {}; // nodeId -> { lat, lon }

// ================================
// STATE
// ================================
const appState = {
  nodes: {},
  incidents: [],
  selectedNodeId: null,
  network: { total: 0, online: 0, offline: 0 }
};


// ================================
// INITIAL LOAD OF NODES
// ================================
async function loadInitialNodes() {
  try {
    const res = await fetch(`${API_BASE}/nodes`);
    const nodes = await res.json(); // ✅ this is an ARRAY

    Object.values(nodes).forEach(node => {
  // 🚫 Ignore error responses
  if (!node || typeof node !== "object" || !node.node) {
    console.warn("Skipping invalid REST node:", node);
    return;
  }

  appState.nodes[node.node] = node;

  if (!nodeMarkers[node.node]) {
    addNodeMarker(node);
  } else {
    updateNodeMarker(node);
  }
});

    updateNetworkStatus();

    console.log(`✅ Loaded ${nodes.length} nodes from REST`);
    console.log("Sample node:", nodes[0]);
  } catch (err) {
    console.error("❌ Failed to load initial nodes:", err);
  }
}

loadInitialNodes();



const nodeMarkers = {}; // nodeId -> Leaflet marker

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

const gatewayIcon = L.icon({
  iconUrl: "/icons/Gateway.png",
  iconSize: [50, 50],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40]
});

// ================================
// GATEWAY MARKER
// ================================
const gatewayMarker = L.marker(
  [GATEWAY_LAT, GATEWAY_LON],
  { icon: gatewayIcon, zIndexOffset: 1000 }
)
  .addTo(map)
  .bindPopup("PHINMA Upang (F.L.A.M.E.S. Gateway)");

gatewayMarker.on("mouseover", () => gatewayMarker.openPopup());
gatewayMarker.on("mouseout", () => gatewayMarker.closePopup());

// ================================
// NODE MARKERS
// ================================
function addNodeMarker(node) {
  let lat, lon;

  // 📍 GPS AVAILABLE
  if (node.lat != null && node.lon != null) {
    lat = node.lat;
    lon = node.lon;
  } 
  // 📍 GPS MISSING → FALLBACK NEAR GATEWAY
  else {
    if (!fallbackPositions[node.node]) {
      const index = Object.keys(fallbackPositions).length + 1;
      const angle = index * 45 * (Math.PI / 180);
      const radius = 0.00025;

      fallbackPositions[node.node] = {
        lat: GATEWAY_LAT + Math.cos(angle) * radius,
        lon: GATEWAY_LON + Math.sin(angle) * radius
      };
    }

    lat = fallbackPositions[node.node].lat;
    lon = fallbackPositions[node.node].lon;
  }

  const marker = L.marker([lat, lon], { icon: nodeIcon }).addTo(map);

  marker.on("click", () => {
  appState.selectedNodeId = node.node;

  // 🔥 ALWAYS read latest data from global state
  const latestNode = appState.nodes[node.node];
  if (latestNode) {
    updateNodeStatus(latestNode);
  }

  map.flyTo([lat, lon], 18);
});

  nodeMarkers[node.node] = marker;
}



// ================================
// UPDATE NODE POSITION
// ================================
function updateNodeMarker(node) {
  const marker = nodeMarkers[node.node];
  if (!marker) return;

  // 🛰 GPS ARRIVED → MOVE TO REAL LOCATION
  if (node.lat != null && node.lon != null) {
    marker.setLatLng([node.lat, node.lon]);
    delete fallbackPositions[node.node];
  }
  // ❗ STILL NO GPS → STAY IN FALLBACK
  else if (fallbackPositions[node.node]) {
    marker.setLatLng([
      fallbackPositions[node.node].lat,
      fallbackPositions[node.node].lon
    ]);
  }

  // 🔴 visual real-time blink
  marker.setOpacity(0.3);
  setTimeout(() => marker.setOpacity(1), 200);
}


// ================================
// NODE STATUS PANEL
// ================================
function updateNodeStatus(node) {

    if (!node || !node.node) {
     document.getElementById("status-content").innerHTML =
      "<p>Select a node to view status</p>";
        return;
    }

    const dt = new Date(node.received_at);

    const dateStr = dt.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "2-digit"
    });

    const timeStr = dt.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
    });


  document.getElementById("status-content").innerHTML = `
    <p><strong>Node ID:</strong> ${node.node}</p>
    <p><strong>Temperature:</strong> ${node.temp} °C</p>
    <p><strong>Humidity:</strong> ${node.hum} %</p>
    <p><strong>Smoke:</strong> ${node.smoke}</p>
    <p><strong>Flame:</strong> ${node.flame ? "YES" : "NO"}</p>

    
    <small><strong>Date:</strong> ${dateStr}</small><br>
    <small><strong>Time:</strong> ${timeStr}</small>
  `;
}

function refreshSelectedNodeStatus(node) {
  if (appState.selectedNodeId === node.node) {
    updateNodeStatus(node);
  }
}

// ================================
// INCIDENTS
// ================================
function renderIncidents() {
  const list = document.getElementById("incidentList");
  const count = document.getElementById("incident-count");

  list.innerHTML = "";

  if (appState.incidents.length === 0) {
    list.innerHTML = "<p>No active incidents.</p>";
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
// WEBSOCKET (REAL-TIME)
// ================================
const ws = new WebSocket(WS_URL);

ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);

  if (msg.type === "node_update") {
  const node = msg.data;

  // 1️⃣ Update global state
  appState.nodes[node.node] = node;

  // 2️⃣ Update or create marker
  if (!nodeMarkers[node.node]) {
    addNodeMarker(node);
  } else {
    updateNodeMarker(node);
  }

  // 3️⃣ 🔥 REAL-TIME NODE STATUS UPDATE
  refreshSelectedNodeStatus(node);

  // 4️⃣ Network status
  updateNetworkStatus();
}

  if (msg.type === "incident") {
    appState.incidents.unshift(msg.data);
    appState.incidents = appState.incidents.slice(0, 20);
    renderIncidents();
  }
};