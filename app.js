const express = require("express");
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

const app = express();
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

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }))


app.use('/booking', require('./routes/bookingRoutes'))

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

app.listen(port, () => console.log(`Server is running on http://localhost:${port}`));