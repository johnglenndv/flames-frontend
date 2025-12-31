// static/websocket.js
const WS_URL = "wss://flames-backend-hbu0.onrender.com/ws";

export function connectWebSocket(onMessage) {
  const ws = new WebSocket(WS_URL);

  ws.onopen = () => {
    console.log("WebSocket connected");
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessage(data);
    } catch {
      // Ignore "connected" or other control messages
      console.debug("WS:", event.data);
    }
  };

  ws.onerror = (err) => {
    console.error("WebSocket error", err);
  };

  return ws;
}
