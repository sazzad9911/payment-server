import express from "express";
import { SystemController } from "./System.controller";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { SystemValidation } from "./System.validation";
import { fileUploader } from "../../../helpars/fileUploader";

const router = express.Router();

router.get("/sim", SystemController.getSimInfos);

router.patch("/sim/:id/ussd", SystemController.updateUssdCode);

router.patch("/sim/:id/toggle-otp", SystemController.toggleActiveOTPSim);
router.get("/contact", auth("ADMIN"), SystemController.getContacts);
router.post(
  "/contact",
  auth(),
  validateRequest(SystemValidation.createContactSchema),
  SystemController.makeContact,
);
router.get("/banner", auth(), SystemController.getBanner);
router.post(
  "/banner",
  auth("ADMIN"),
  fileUploader.upload.single("file"),
  SystemController.createBanner,
);
router.delete("/banner/:id", auth("ADMIN"), SystemController.deleteBanner);
router.get("/overview/user", auth(), SystemController.userOverview);
router.get("/overview/admin", auth("ADMIN"), SystemController.adminOverview);

export const SystemRoutes = router;
