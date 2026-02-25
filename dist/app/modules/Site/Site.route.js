"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SiteRoute = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const Site_controller_1 = require("./Site.controller");
const fileUploader_1 = require("../../../helpars/fileUploader");
const route = express_1.default.Router();
route.post("/", (0, auth_1.default)("ADMIN"), fileUploader_1.fileUploader.upload.single("logo"), Site_controller_1.SiteController.createSite);
route.put("/:id", (0, auth_1.default)("ADMIN"), fileUploader_1.fileUploader.upload.single("logo"), Site_controller_1.SiteController.updateSite);
route.delete("/:id", (0, auth_1.default)("ADMIN"), Site_controller_1.SiteController.deleteSite);
route.get("/", (0, auth_1.default)("ADMIN"), Site_controller_1.SiteController.getAllSites);
route.patch("/:id/status", (0, auth_1.default)("ADMIN"), Site_controller_1.SiteController.toggleSiteStatus);
exports.SiteRoute = route;
