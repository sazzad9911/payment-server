import express from "express";
import { BillController } from "./Bill.controller";
import { fileUploader } from "../../../helpars/fileUploader";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { BillValidation } from "./Bill.validation";

const router = express.Router();

// Category
router.post(
  "/category",
  auth("ADMIN"),
  fileUploader.upload.single("icon"),
  BillController.createBillCategory,
);
router.get("/category", auth(), BillController.getBillCategory);
router.delete(
  "/category/:id",
  auth("ADMIN"),
  BillController.deleteBillCategory,
);

// Biller
router.post(
  "/biller",
  auth("ADMIN"),
  fileUploader.upload.single("icon"),
  BillController.createBiller,
);
router.get("/biller", auth(), BillController.getBiller);
router.delete("/biller/:id", auth("ADMIN"), BillController.deleteBiller);

// Bill history
router.post(
  "/pay",
  auth(),
  validateRequest(BillValidation.BillHistorySchema),
  BillController.createBillHistory,
);
router.get("/history", auth(), BillController.getBillHistory);
router.patch(
  "/history/:id/accept",
  auth("ADMIN"),
  BillController.acceptBillPayment,
);
router.patch(
  "/history/:id/reject",
  auth("ADMIN"),
  BillController.rejectBillPayment,
);
export const BillRoutes = router;
