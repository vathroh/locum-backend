const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const dotenv = require("dotenv").config();
const cors = require("cors");
const port = process.env.PORT;
const path = require("path");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const { Server } = require("socket.io");

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        allowedHeaders: ["Access-Control-Allow-Credentials"],
        credentials: false,
    },
});

app.use(
    cors({
        origin: true,
        credentials: true,
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/public", express.static(path.join(__dirname, "./public")));

mongoose.connect(process.env.MONGOURI, {
    // autoIndex: false,
    // useNewUrlParser: true,
    useUnifiedTopology: true,
    // maxPoolSize: 5,
});

const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("Database Connected"));

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        store: MongoStore.create({
            client: mongoose.connection.getClient(),
        }),
        resave: false,
        saveUninitialized: false,
    })
);

app.get("/socket.io/socket.io.js", (req, res) => {
    res.sendFile(
        __dirname + "/node_modules/socket.io/client-dist/socket.io.js"
    );
});

require("./routes")(app);
require("./services/cronJob");
// app.use('/quee/send', require('./services/rabbitmq/producer.js'))
// app.use('/quee/receive', require('./services/rabbitmq/subcriber.js'))

const users = [];

io.on("connection", (socket) => {
    console.log(`User ${socket.id} has Joined`);

    socket.on("join", (data) => {
        const user = {
            socket_id: socket.id,
            user_id: data._id,
            full_name: data.full_name,
        };
        users.push(user);
        // console.log(socket);
    });

    socket.on("message", (data) => {
        socket.broadcast.emit("message", data);
        // console.log(data);
    });

    socket.on("disconnect", () => {
        socket.broadcast.emit(
            "user-disconnected",
            `${socket.id} has disconnected`
        );
        const user = users.findIndex((user) => user.socket_id == socket.id);
        // console.log(`${socket.id} has disconnected`);
    });
});

server.listen(port, () =>
    console.log(`Server is running on http://localhost:${port}`)
);
