"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillRoutes = void 0;
const express_1 = __importDefault(require("express"));
const Bill_controller_1 = require("./Bill.controller");
const fileUploader_1 = require("../../../helpars/fileUploader");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const Bill_validation_1 = require("./Bill.validation");
const router = express_1.default.Router();
// Category
router.post("/category", (0, auth_1.default)("ADMIN"), fileUploader_1.fileUploader.upload.single("icon"), Bill_controller_1.BillController.createBillCategory);
router.get("/category", (0, auth_1.default)(), Bill_controller_1.BillController.getBillCategory);
router.delete("/category/:id", (0, auth_1.default)("ADMIN"), Bill_controller_1.BillController.deleteBillCategory);
// Biller
router.post("/biller", (0, auth_1.default)("ADMIN"), fileUploader_1.fileUploader.upload.single("icon"), Bill_controller_1.BillController.createBiller);
router.get("/biller", (0, auth_1.default)(), Bill_controller_1.BillController.getBiller);
router.delete("/biller/:id", (0, auth_1.default)("ADMIN"), Bill_controller_1.BillController.deleteBiller);
// Bill history
router.post("/pay", (0, auth_1.default)(), (0, validateRequest_1.default)(Bill_validation_1.BillValidation.BillHistorySchema), Bill_controller_1.BillController.createBillHistory);
router.get("/history", (0, auth_1.default)(), Bill_controller_1.BillController.getBillHistory);
router.patch("/history/:id/accept", (0, auth_1.default)("ADMIN"), Bill_controller_1.BillController.acceptBillPayment);
router.patch("/history/:id/reject", (0, auth_1.default)("ADMIN"), Bill_controller_1.BillController.rejectBillPayment);
exports.BillRoutes = router;
