const { authJwtMiddleware } = require("../middleware/authMiddleware");
const express = require("express");
const router = express.Router();

const {
  verifyPhoneNumber,
  sendPhoneVerificationCode,
} = require("../controllers/authController.js");
// forgotPassword,

const {
  verifyEmail,
  updateRoleUser,
  afterGoogleSignin,
  afterGoogleSignup,
  updatePhoneNumber,
  loginWithFirebase,
  clinicAdminRegister,
  forgotEmailPassword,
  registerWithFirebase,
  verifyForgotPassword,
  updateForgotenPassword,
  changeFirebasePasswordByUser,
  sendingEmailVerificationCode,
  changeFirebasePasswordByAdmin,
  changeClininAdminPasswordByAdmin,
} = require("../controllers/firebaseController");

router.post(
  "/change-password-by-user",
  authJwtMiddleware,
  changeFirebasePasswordByUser
);

router.post(
  "/change-password",
  authJwtMiddleware,
  changeClininAdminPasswordByAdmin
);

router.post(
  "/update-phone-number/:userId",
  authJwtMiddleware,
  updatePhoneNumber
);

router.post(
  "/send-phone-verification/:userId",
  authJwtMiddleware,
  sendPhoneVerificationCode
);

router.post(
  "/update-password",
  authJwtMiddleware,
  changeFirebasePasswordByAdmin
);

router.post(
  "/update-forgoten-password",
  authJwtMiddleware,
  updateForgotenPassword
);

router.post("/send-email-verification/:userId", sendingEmailVerificationCode);
router.post("/verify-phone-number", authJwtMiddleware, verifyPhoneNumber);
router.post("/update-role/:userId", authJwtMiddleware, updateRoleUser);
router.post("/forgot-password-verification", verifyForgotPassword);
router.post("/clinic-manager/sign-up", clinicAdminRegister);
router.post("/email-forgot-password", forgotEmailPassword);
router.post("/after-google-signin", afterGoogleSignin);
router.post("/after-google-signup", afterGoogleSignup);
router.post("/register", registerWithFirebase);
router.post("/verify-email", verifyEmail);
router.post("/login", loginWithFirebase);
router.post("/logout", (req, res) => {
  req.session.destroy();
  res.end();
});

module.exports = router;
