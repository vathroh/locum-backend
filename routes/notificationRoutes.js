const router = require("express").Router();

const {
  readNotification,
  sendNotification,
  deleteNotification,
  getNotificationByUserId,
} = require("../controllers/notificationController");

router.delete("/:notificationId", deleteNotification);
router.get("/user", getNotificationByUserId);
router.put("/user", readNotification);
router.post("/", sendNotification);

module.exports = router;
