"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRoute = void 0;
const express_1 = __importDefault(require("express"));
const User_controller_1 = require("./User.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const enums_1 = require("../../../generated/prisma/enums");
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const User_validation_1 = require("./User.validation");
const router = express_1.default.Router();
/**
 * 🔹 Admin-only routes
 */
// Get user list (pagination + search)
router.get("/", (0, auth_1.default)(enums_1.UserRole.ADMIN), User_controller_1.UserController.getUserList);
// Update user
router.patch("/", (0, auth_1.default)(), (0, validateRequest_1.default)(User_validation_1.UserValidation.UpdateUserSchema), User_controller_1.UserController.updateUser);
// Block / unblock user
router.patch("/:userId/toggle-block", (0, auth_1.default)(enums_1.UserRole.ADMIN), User_controller_1.UserController.toggleBlockUser);
router.patch("/:userId/add-balance", (0, auth_1.default)(enums_1.UserRole.ADMIN), (0, validateRequest_1.default)(User_validation_1.UserValidation.BalanceShema), User_controller_1.UserController.addBalance);
router.patch("/:userId/cut-balance", (0, auth_1.default)(enums_1.UserRole.ADMIN), (0, validateRequest_1.default)(User_validation_1.UserValidation.BalanceShema), User_controller_1.UserController.cutBalance);
exports.UserRoute = router;
