import exporess from "express";
import auth from "../../middlewares/auth";
import { BankControllers } from "./Bank.controller";
const route = exporess.Router();

route.get("/", auth("ADMIN"), BankControllers.getAllBanksController);
route.patch(
  "/:id/toggle-status",
  auth("ADMIN"),
  BankControllers.toggleBankStatusController,
);
route.delete("/:id", auth("ADMIN"), BankControllers.deleteBankController);

export const BankRoute = route;
