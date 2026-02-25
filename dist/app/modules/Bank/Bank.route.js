"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BankRoute = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const Bank_controller_1 = require("./Bank.controller");
const route = express_1.default.Router();
route.get("/", (0, auth_1.default)("ADMIN"), Bank_controller_1.BankControllers.getAllBanksController);
route.patch("/:id/toggle-status", (0, auth_1.default)("ADMIN"), Bank_controller_1.BankControllers.toggleBankStatusController);
route.delete("/:id", (0, auth_1.default)("ADMIN"), Bank_controller_1.BankControllers.deleteBankController);
exports.BankRoute = route;
