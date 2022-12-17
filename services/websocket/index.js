const users = [];
const connected_clients = new Map();
const { saveMessage } = require("./chatting");

const socket = (wss, WebSocket) => {
  wss.on("connection", function connection(ws) {
    console.log("A new client Connected!");

    // NOTE: only for demonstration, will cause collisions.  Use a UUID or some other identifier that's actually unique.
    const this_stream_id = Array.from(connected_clients.values()).length;

    // Keep track of the stream, so that we can send all of them messages.
    connected_clients.set(this_stream_id, ws);

    // Attach event handler to mark this client as alive when pinged.
    ws.is_alive = true;
    ws.on("pong", () => {
      ws.is_alive = true;
    });

    // When the stream is closed, clean up the stream reference.
    ws.on("close", function () {
      connected_clients.delete(this_stream_id);
    });

    ws.on("message", function incoming(message) {
      //   console.log("received: %s", message);
      //   ws.send(message.toString("utf8"));
      const data = JSON.parse(message.toString());
      saveMessage(data);

      wss.clients.forEach(function each(client) {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(message.toString("utf8"));
        }
      });
    });
  });

  setInterval(function ping() {
    Array.from(connected_clients.values()).forEach(function each(
      client_stream
    ) {
      if (!client_stream.is_alive) {
        client_stream.terminate();
        return;
      }
      client_stream.is_alive = false;
      client_stream.ping();
    });
  }, 1000);
};

module.exports = { socket };
