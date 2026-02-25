"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = void 0;
const express_1 = __importDefault(require("express"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const auth_controller_1 = require("./auth.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const auth_validation_1 = require("./auth.validation");
const router = express_1.default.Router();
// user register
router.post("/register", (0, validateRequest_1.default)(auth_validation_1.authValidation.RegisterSchema), auth_controller_1.AuthController.registerUser);
// send otp
router.post("/send-otp", (0, validateRequest_1.default)(auth_validation_1.authValidation.otpSchema), auth_controller_1.AuthController.sendOtp);
// verify otp
router.post("/otp-verify", (0, validateRequest_1.default)(auth_validation_1.verifyOtpSchema), auth_controller_1.AuthController.verifyOtp);
// user login route
router.post("/login", (0, validateRequest_1.default)(auth_validation_1.authValidation.loginSchema), auth_controller_1.AuthController.loginUser);
// user logout route
router.post("/logout", auth_controller_1.AuthController.logoutUser);
router.patch("/change-password", (0, auth_1.default)(), (0, validateRequest_1.default)(auth_validation_1.authValidation.changePasswordSchema), auth_controller_1.AuthController.changePassword);
router.post("/forgot-password", (0, validateRequest_1.default)(auth_validation_1.authValidation.forgetPasswordSchema), auth_controller_1.AuthController.forgotPassword);
router.post("/reset-password", (0, validateRequest_1.default)(auth_validation_1.authValidation.resetPasswordSchema), auth_controller_1.AuthController.resetPassword);
router.get("/check-auth", (0, auth_1.default)(), auth_controller_1.AuthController.checkAuth);
router.patch("/token", (0, auth_1.default)(), (0, validateRequest_1.default)(auth_validation_1.authValidation.updateTokenSchema), auth_controller_1.AuthController.updateToken);
exports.authRoutes = router;
