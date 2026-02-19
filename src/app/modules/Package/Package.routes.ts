import { Router } from "express";
import validateRequest from "../../middlewares/validateRequest";
import { PackageValidation } from "./Package.Validation";
import { PackageController } from "./Package.controller";
import auth from "../../middlewares/auth";

const router = Router();
router.post("/buy-package/:id", auth(), PackageController.buyPackage);
router.patch(
  "/settings",
  auth("ADMIN"),
  validateRequest(PackageValidation.settingsSchema),
  PackageController.updateSettings,
);
router.get("/settings", auth("ADMIN"), PackageController.getSettings);
router.post(
  "/",
  auth("ADMIN"),
  validateRequest(PackageValidation.packageSchema),
  PackageController.createPackage,
);

router.get("/", auth(), PackageController.getAllPackages);

router.get("/:id", auth("ADMIN"), PackageController.getPackageById);

router.patch(
  "/:id",
  auth("ADMIN"),
  validateRequest(PackageValidation.updatePackageSchema),
  PackageController.updatePackage,
);

router.delete("/:id", auth("ADMIN"), PackageController.deletePackage);
router.post("/buy-package/:id", auth(), PackageController.buyPackage);
export const PackageRoutes = router;
