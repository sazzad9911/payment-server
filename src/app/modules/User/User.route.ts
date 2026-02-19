import express from "express";
import { UserController } from "./User.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "../../../generated/prisma/enums";
import validateRequest from "../../middlewares/validateRequest";
import { UserValidation } from "./User.validation";

const router = express.Router();

/**
 * 🔹 Admin-only routes
 */

// Get user list (pagination + search)
router.get("/", auth(UserRole.ADMIN), UserController.getUserList);

// Update user
router.patch(
  "/",
  auth(),
  validateRequest(UserValidation.UpdateUserSchema),
  UserController.updateUser,
);

// Block / unblock user
router.patch(
  "/:userId/toggle-block",
  auth(UserRole.ADMIN),
  UserController.toggleBlockUser,
);
router.patch(
  "/:userId/add-balance",
  auth(UserRole.ADMIN),
  validateRequest(UserValidation.BalanceShema),
  UserController.addBalance,
);
router.patch(
  "/:userId/cut-balance",
  auth(UserRole.ADMIN),
  validateRequest(UserValidation.BalanceShema),
  UserController.cutBalance,
);
export const UserRoute = router;
