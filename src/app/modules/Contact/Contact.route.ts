import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import { ContactValidation } from "./Contact.validation";
import { ContactController } from "./Contact.controller";
import auth from "../../middlewares/auth";
import { fileUploader } from "../../../helpars/fileUploader";

const route = express.Router();

route.post(
  "/",
  validateRequest(ContactValidation.contactSchema),
  ContactController.createContact,
);
route.get("/", auth("ADMIN"), ContactController.getAllContacts);
route.post(
  "/merchant",
  fileUploader.upload.fields([
    { name: "trade", maxCount: 1 },
    { name: "tin", maxCount: 1 },
    { name: "nid", maxCount: 1 },
    { name: "image", maxCount: 1 },
  ]),
  ContactController.createMerchant,
);
route.get("/merchant", auth("ADMIN"), ContactController.getAllMerchant);
export const ContactRoute = route;
