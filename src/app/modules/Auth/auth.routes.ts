import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import { AuthController } from "./auth.controller";
import auth from "../../middlewares/auth";
import { authValidation, verifyOtpSchema } from "./auth.validation";

const router = express.Router();

// user register
router.post(
  "/register",
  validateRequest(authValidation.RegisterSchema),
  AuthController.registerUser,
);
// send otp
router.post(
  "/send-otp",
  validateRequest(authValidation.otpSchema),
  AuthController.sendOtp,
);
// verify otp
router.post(
  "/otp-verify",
  validateRequest(verifyOtpSchema),
  AuthController.verifyOtp,
);

// user login route
router.post(
  "/login",
  validateRequest(authValidation.loginSchema),
  AuthController.loginUser,
);

// user logout route
router.post("/logout", AuthController.logoutUser);

router.patch(
  "/change-password",
  auth(),
  validateRequest(authValidation.changePasswordSchema),
  AuthController.changePassword,
);

router.post(
  "/forgot-password",
  validateRequest(authValidation.forgetPasswordSchema),
  AuthController.forgotPassword,
);

router.post(
  "/reset-password",
  validateRequest(authValidation.resetPasswordSchema),
  AuthController.resetPassword,
);
router.get("/check-auth", auth(), AuthController.checkAuth);
router.patch(
  "/token",
  auth(),
  validateRequest(authValidation.updateTokenSchema),
  AuthController.updateToken,
);

export const authRoutes = router;
