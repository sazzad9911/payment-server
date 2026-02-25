import express from "express";
import auth from "../../middlewares/auth";
import { SiteController } from "./Site.controller";
import { fileUploader } from "../../../helpars/fileUploader";

const route = express.Router();
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
