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
exports.PackageController = void 0;
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const Package_service_1 = require("./Package.service");
/**
 * Create
 */
const createPackage = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield Package_service_1.PackageService.createPackage(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: 201,
        success: true,
        message: "Package created successfully",
        data: result,
    });
}));
/**
 * Get All
 */
const getAllPackages = (0, catchAsync_1.default)((_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield Package_service_1.PackageService.getAllPackages();
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Packages retrieved successfully",
        data: result,
    });
}));
/**
 * Get One
 */
const getPackageById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield Package_service_1.PackageService.getPackageById(req.params.id);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Package retrieved successfully",
        data: result,
    });
}));
/**
 * Update
 */
const updatePackage = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield Package_service_1.PackageService.updatePackage(req.params.id, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Package updated successfully",
        data: result,
    });
}));
/**
 * Delete
 */
const deletePackage = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield Package_service_1.PackageService.deletePackage(req.params.id);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Package deleted successfully",
    });
}));
const buyPackage = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield Package_service_1.PackageService.buyPackage(req.user.id, req.params.id);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Package updated successfully",
        data: result,
    });
}));
const updateSettings = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield Package_service_1.PackageService.updateSettings(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        data: result,
        message: "Update successful",
    });
}));
const getSettings = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield Package_service_1.PackageService.getSettings();
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        data: result,
        message: "Fetched successful",
    });
}));
exports.PackageController = {
    deletePackage,
    getPackageById,
    getAllPackages,
    updatePackage,
    createPackage,
    buyPackage,
    updateSettings,
    getSettings,
};
