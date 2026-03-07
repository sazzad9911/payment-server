"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentRoute = void 0;
const express_1 = __importDefault(require("express"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const Payment_validation_1 = require("./Payment.validation");
const Payment_controller_1 = require("./Payment.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const route = express_1.default.Router();
route.get("/list", (0, auth_1.default)("ADMIN"), Payment_controller_1.getPaymentList);
route.post("/get-payment-url", (0, validateRequest_1.default)(Payment_validation_1.PaymentValidation.createPaymentSchema), Payment_controller_1.createPaymentUrl);
route.get("/callback", Payment_controller_1.renderPaymentPage);
route.post("/submit", Payment_controller_1.submitPayment);
route.get("/status/:id", Payment_controller_1.paymentStatus);
exports.PaymentRoute = route;
