"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactRoute = void 0;
const express_1 = __importDefault(require("express"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const Contact_validation_1 = require("./Contact.validation");
const Contact_controller_1 = require("./Contact.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const fileUploader_1 = require("../../../helpars/fileUploader");
const route = express_1.default.Router();
route.post("/", (0, validateRequest_1.default)(Contact_validation_1.ContactValidation.contactSchema), Contact_controller_1.ContactController.createContact);
route.get("/", (0, auth_1.default)("ADMIN"), Contact_controller_1.ContactController.getAllContacts);
route.post("/merchant", fileUploader_1.fileUploader.upload.fields([
    { name: "trade", maxCount: 1 },
    { name: "tin", maxCount: 1 },
    { name: "nid", maxCount: 1 },
    { name: "image", maxCount: 1 },
]), Contact_controller_1.ContactController.createMerchant);
route.get("/merchant", (0, auth_1.default)("ADMIN"), Contact_controller_1.ContactController.getAllMerchant);
exports.ContactRoute = route;
