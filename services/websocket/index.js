const { onMessage, users } = require("./onMessage");
const { onClose } = require("./onClose");

const socket = (wss, WebSocket) => {
  wss.on("connection", async function connection(ws) {
    console.log("A new client Connected!");
    ws.is_alive = true;

    await onMessage(ws, wss, WebSocket);
    await onClose(ws, wss, WebSocket, users);
  });
};

module.exports = { socket };
