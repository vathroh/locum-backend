const { authJwtMiddleware } = require("../middleware/authMiddleware");
const attendanceRoute = require("./attendanceRecordRoutes.js");
const doctorRanksRoute = require("./doctorRanksRoutes.js");
const clinicRoute = require("./clinicRoutes.js");
const doctorRoute = require("./doctorRoutes.js");
const indexRoute = require("./indexRoutes.js");
const authRoutes = require("./authRoutes.js");
const userRoute = require("./userRoutes.js");
const fcmRoute = require("./fcmRoutes");
const { genCode } = require("../utils/genClinicInitial");

module.exports = function (app) {
  app.post("/gencode", genCode);
  app.use("/conversation", authJwtMiddleware, require("./conversationRoutes"));

  app.use(
    "/attendance",
    authJwtMiddleware,
    require("./attendanceRecordRoutes")
  );

  app.use(
    "/certificate-item",
    authJwtMiddleware,
    require("./certificateItemRoutes")
  );

  app.use("/achievement", authJwtMiddleware, require("./achievementRoutes"));
  app.use("/certificates", authJwtMiddleware, require("./certificateRoutes"));
  app.use("/clinic-group", authJwtMiddleware, require("./clinicGroupRoutes"));
  app.use("/vaccination", authJwtMiddleware, require("./vaccinationRoutes"));
  app.use("/calendar", authJwtMiddleware, require("./calendarRoutes"));
  app.use("/messages", authJwtMiddleware, require("./messageRoutes"));
  app.use("/settings", authJwtMiddleware, require("./settingRoutes"));
  app.use("/booking", authJwtMiddleware, require("./bookingRoutes"));
  app.use("/comment", authJwtMiddleware, require("./commentRoutes"));
  app.use("/device", authJwtMiddleware, require("./deviceRoutes"));
  app.use("/resume", authJwtMiddleware, require("./resumeRoutes"));
  app.use("/google-calendar", require("./googleCalendarRoutes"));
  app.use("/jobs", authJwtMiddleware, require("./jobRoutes.js"));
  app.use("/attendance", authJwtMiddleware, attendanceRoute);
  app.use("/preferences", require("./preferenceRoutes"));
  app.use("/clinic", authJwtMiddleware, clinicRoute);
  app.use("/user", authJwtMiddleware, userRoute);
  app.use("/faker", require("./fakerRoutes"));
  app.use("/doctor-ranks", doctorRanksRoute);
  app.use("/doctor", doctorRoute);
  app.use("/auth", authRoutes);
  app.use("/send", fcmRoute);
  app.use("/", indexRoute);
};
