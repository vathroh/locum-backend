const { saveMessage } = require("./chatting");
const { saveUserOnline } = require("./onlineUser");
const { deleteUser } = require("../../utils/onlineUser");

const uniqid = require("uniqid");

let user = {};
const users = [];

const onMessage = (ws, wss, WebSocket) => {
  const socketId = uniqid();
  ws.on("message", async function incoming(message) {
    const data = JSON.parse(message.toString());

    if (data.service === "onlineUser") {
      ws.user = data.userId;
      ws.socketId = socketId;

      user = { user: data.userId, socket: socketId };
      users.push(user);
      await saveUserOnline(user);
      console.log(user);
    }

    if (data.service === "chat") {
      const savedMessage = await saveMessage(data);
      responseMessage(ws, wss, WebSocket, savedMessage);
      sendMessage(ws, wss, WebSocket, savedMessage);
    }

    ws.on("close", function () {
      console.log("user is leaving");
      const user = { user: ws.user, socket: ws.socketId };
      deleteUser(user);
    });
  });
};

const responseMessage = (ws, wss, WebSocket, data) => {
  const sendMessage = JSON.stringify(data);
  wss.clients.forEach(function each(client) {
    if (client == ws && client.readyState === WebSocket.OPEN) {
      client.send(sendMessage);
    }
  });
};

const sendMessage = (ws, wss, WebSocket, data) => {
  const sendMessage = JSON.stringify(data);
  wss.clients.forEach(function each(client) {
    if (client !== ws && client.readyState === WebSocket.OPEN) {
      client.send(sendMessage);
    }
  });
};

module.exports = { onMessage, users, user };
