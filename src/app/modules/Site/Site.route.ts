import express from "express";
import auth from "../../middlewares/auth";
import { SiteController } from "./Site.controller";
import { fileUploader } from "../../../helpars/fileUploader";
import validateRequest from "../../middlewares/validateRequest";
import { SiteValidation } from "./Site.validation";

const route = express.Router();

route.get("/dashboard", auth("ADMIN"), SiteController.getDashboardInfo);

//withdraw
route.post(
  "/withdraw",
  validateRequest(SiteValidation.createWithdrawSchema),
  SiteController.createWithdraw,
);
route.get("/withdraw", auth("ADMIN"), SiteController.getAllWithdraws);

route.patch(
  "/withdraw/:id/accept",
  auth("ADMIN"),
  SiteController.acceptWithdraw,
);

route.patch(
  "/withdraw/:id/cancel",
  auth("ADMIN"),
  SiteController.cancelWithdraw,
);

//////////
route.post(
  "/",
  auth("ADMIN"),
  fileUploader.upload.single("logo"),
  SiteController.createSite,
);
route.put(
  "/:id",
  auth("ADMIN"),
  fileUploader.upload.single("logo"),
  SiteController.updateSite,
);
route.delete("/:id", auth("ADMIN"), SiteController.deleteSite);
route.get("/", auth("ADMIN"), SiteController.getAllSites);
route.patch("/:id/status", auth("ADMIN"), SiteController.toggleSiteStatus);

export const SiteRoute = route;
