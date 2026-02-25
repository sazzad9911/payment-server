"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemController = void 0;
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const System_service_1 = require("./System.service");
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const getSimInfos = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield System_service_1.SystemService.getSimInfos();
    res.status(200).json({
        success: true,
        data: result,
    });
}));
const updateUssdCode = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { code } = req.body;
    const result = yield System_service_1.SystemService.updateUssdCode(code, id);
    res.status(200).json({
        success: true,
        message: "USSD code updated successfully",
        data: result,
    });
}));
const toggleActiveOTPSim = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield System_service_1.SystemService.toggleActiveOTPSim(id);
    res.status(200).json({
        success: true,
        message: "OTP SIM status updated",
        data: result,
    });
}));
const getContacts = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield System_service_1.SystemService.getContacts(req.query);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Contacts fetched successful!",
        data: result.data,
        meta: result.meta,
    });
}));
const makeContact = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield System_service_1.SystemService.makeContact(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Contact created!",
        data: result,
    });
}));
const createBanner = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield System_service_1.SystemService.createBanner(req, req.file);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Banner created!",
        data: result,
    });
}));
const getBanner = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield System_service_1.SystemService.getBanner();
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Banner fetched!",
        data: result,
    });
}));
const deleteBanner = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield System_service_1.SystemService.deleteBanner(req.params.id);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Banner deleted!",
        data: result,
    });
}));
const userOverview = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const sort = req.query.sort || "day";
    const result = yield System_service_1.SystemService.userOverview(userId, sort);
    res.status(200).json({
        success: true,
        message: "User overview retrieved successfully",
        data: result,
    });
}));
/**
 * ADMIN OVERVIEW
 * GET /api/overview/admin
 */
const adminOverview = (0, catchAsync_1.default)((_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const sort = _req.query.sort || "day";
    const result = yield System_service_1.SystemService.adminOverview(sort);
    res.status(200).json({
        success: true,
        message: "Admin overview retrieved successfully",
        data: result,
    });
}));
exports.SystemController = {
    getSimInfos,
    updateUssdCode,
    toggleActiveOTPSim,
    getBanner,
    createBanner,
    getContacts,
    makeContact,
    deleteBanner,
    userOverview,
    adminOverview,
};
