const express = require("express");
const http = require('http')
const mongoose = require("mongoose");
const dotenv = require('dotenv').config();
const doctorRoute = require("./routes/doctorRoutes.js");
const clinicRoute = require("./routes/clinicRoutes.js");
const authRoutes = require('./routes/authRoutes.js');
const userRoute = require('./routes/userRoutes.js');
const userRoleRoute = require('./routes/userRoleRoutes.js');
const attendanceRoute = require('./routes/attendanceRecordRoutes.js');
const doctorRanksRoute = require('./routes/doctorRanksRoutes.js');
const indexRoute = require('./routes/indexRoutes.js')
const fcmRoute = require('./routes/fcmRoutes')
const cors = require("cors");
const port = process.env.PORT
const path = require('path')
const { Server } = require('socket.io')

const app = express();




const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }))

app.use('/public', express.static(path.join(__dirname, './public')))

mongoose.connect(process.env.MONGOURI, {
  autoIndex: false,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 5
});

const db = mongoose.connection;
db.on('error', (error) => console.error(error));
db.once('open', () => console.log('Database Connected'));

app.get('/socket.io/socket.io.js', (req, res) => {
  res.sendFile(__dirname + '/node_modules/socket.io/client-dist/socket.io.js');
});


app.use('/booking', require('./routes/bookingRoutes'))
app.use('/calendar', require('./routes/calendarRoutes'))
app.use('/conversation', require('./routes/conversationRoutes'))
app.use('/clinic-group', require('./routes/clinicGroupRoutes'))
app.use('/comment', require('./routes/commentRoutes'))
app.use('/jobs', require('./routes/jobRoutes.js'))
app.use('/doctor-ranks', doctorRanksRoute)
app.use('/attendance', attendanceRoute)
app.use('/user-role', userRoleRoute)
app.use('/doctor', doctorRoute);
app.use('/clinic', clinicRoute);
app.use('/send', fcmRoute);
app.use('/auth', authRoutes)
app.use('/user', userRoute)
app.use('/', indexRoute)

// app.use('/quee/send', require('./services/rabbitmq/producer.js')) 
// app.use('/quee/receive', require('./services/rabbitmq/subcriber.js'))

let clients = {}



// io.on("connection", (socket) => {
//     console.log("connected");
//     console.log(socket.id, "has joined");

//     socket.on("signin", (id) => {
//         console.log(id);
//         clients[id] = id
//         console.log(clients)
//     })

//     socket.on("message", (msg) => {
//         console.log(msg);
//         let targetId = msg.targetId;
//         if (clients[targetId]) clients[targetId].emit("message", msg)
//     })
// })


const users = {}

io.on('connection', socket => {
  console.log("hai")

  socket.on('join', data => {
    console.log(data)
  })

  socket.on('new-user', name => {
    users[socket.id] = name
    console.log(users)
    socket.broadcast.emit('user-connected', name)
  })
  socket.on('send-chat-message', message => {
    console.log(message, users)
    socket.broadcast.emit('chat-message', { message: message, name: users[socket.id] })
  })
  socket.on('disconnect', () => {
    socket.broadcast.emit('user-disconnected', users[socket.id])
    delete users[socket.id]
  })
})


server.listen(port, () => console.log(`Server is running on http://localhost:${port}`));
