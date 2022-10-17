const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const dotenv = require("dotenv").config();
const doctorRoute = require("./routes/doctorRoutes.js");
const clinicRoute = require("./routes/clinicRoutes.js");
const authRoutes = require("./routes/authRoutes.js");
const userRoute = require("./routes/userRoutes.js");
const attendanceRoute = require("./routes/attendanceRecordRoutes.js");
const { authJwtMiddleware } = require("./middleware/authMiddleware");
const doctorRanksRoute = require("./routes/doctorRanksRoutes.js");
const indexRoute = require("./routes/indexRoutes.js");
const fcmRoute = require("./routes/fcmRoutes");
const cors = require("cors");
const port = process.env.PORT;
const path = require("path");
const { Server } = require("socket.io");

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
    },
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/public", express.static(path.join(__dirname, "./public")));

mongoose.connect(process.env.MONGOURI, {
    autoIndex: false,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: 5,
});

const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("Database Connected"));

app.get("/socket.io/socket.io.js", (req, res) => {
    res.sendFile(
        __dirname + "/node_modules/socket.io/client-dist/socket.io.js"
    );
});

app.use("/booking", authJwtMiddleware, require("./routes/bookingRoutes"));
app.use("/calendar", authJwtMiddleware, require("./routes/calendarRoutes"));
app.use(
    "/conversation",
    authJwtMiddleware,
    require("./routes/conversationRoutes")
);
app.use(
    "/clinic-group",
    authJwtMiddleware,
    require("./routes/clinicGroupRoutes")
);
app.use("/messages", authJwtMiddleware, require("./routes/messageRoutes"));
app.use("/comment", authJwtMiddleware, require("./routes/commentRoutes"));
app.use("/jobs", authJwtMiddleware, require("./routes/jobRoutes.js"));
app.use("/attendance", authJwtMiddleware, attendanceRoute);
app.use("/clinic", authJwtMiddleware, clinicRoute);
app.use("/user", authJwtMiddleware, userRoute);
app.use("/doctor-ranks", doctorRanksRoute);
app.use("/doctor", doctorRoute);
app.use("/auth", authRoutes);
app.use("/send", fcmRoute);
app.use("/", indexRoute);

// app.use('/quee/send', require('./services/rabbitmq/producer.js'))
// app.use('/quee/receive', require('./services/rabbitmq/subcriber.js'))

const users = [];

io.on("connection", (socket) => {
    console.log(`User ${socket.id} has Joined`);
    users.push(socket.id);

    socket.on("join", (data) => {
        console.log(data);
    });

    socket.on("message", (data) => {
        socket.broadcast.emit("message", data);
        console.log(data);
    });

    socket.on("disconnect", () => {
        socket.broadcast.emit(
            "user-disconnected",
            `${socket.id} has disconnected`
        );
        console.log(`${socket.id} has disconnected`);
        delete users[socket.id];
    });
});

server.listen(port, () =>
    console.log(`Server is running on http://localhost:${port}`)
);
