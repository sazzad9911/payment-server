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
exports.RechargeController = void 0;
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const recharge_service_1 = require("./recharge.service");
const createOffer = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name } = req.body;
    const result = yield recharge_service_1.RechargeServices.createOffer(name);
    res.status(200).json({
        success: true,
        message: "Offer created successfully",
        data: result,
    });
}));
const retryRecharge = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield recharge_service_1.RechargeServices.retryRecharge(id);
    res.status(200).json({
        success: true,
        message: "Recharge request send successfully",
        data: result,
    });
}));
const deleteOffer = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { offerId } = req.params;
    const result = yield recharge_service_1.RechargeServices.deleteOffer(offerId);
    res.status(200).json({
        success: true,
        message: "Offer deleted successfully",
        data: result,
    });
}));
const updateOffer = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { offerId } = req.params;
    const { name } = req.body;
    const result = yield recharge_service_1.RechargeServices.updateOffer(offerId, name);
    res.status(200).json({
        success: true,
        message: "Offer updated successfully",
        data: result,
    });
}));
const getAllOffers = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield recharge_service_1.RechargeServices.getAllOffers();
    res.status(200).json({
        success: true,
        message: "Offers retrieved successfully",
        data: result,
    });
}));
const createRechargeOffer = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield recharge_service_1.RechargeServices.createRechargeOffer(req.body);
    res.status(200).json({
        success: true,
        message: "Recharge offer created successfully",
        data: result,
    });
}));
const updateRechargeOffer = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield recharge_service_1.RechargeServices.updateRechargeOffer(id, req.body);
    res.status(200).json({
        success: true,
        message: "Recharge offer updated successfully",
        data: result,
    });
}));
const deleteRechargeOffer = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield recharge_service_1.RechargeServices.deleteRechargeOffer(id);
    res.status(200).json({
        success: true,
        message: "Recharge offer deleted successfully",
        data: result,
    });
}));
const getRechargeOffers = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield recharge_service_1.RechargeServices.getRechargeOffers(req.query);
    res.status(200).json({
        success: true,
        message: "Recharge offers retrieved successfully",
        data: result,
    });
}));
const getRechargeOfferByAmount = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield recharge_service_1.RechargeServices.getRechargeOfferByAmount(req.query);
    res.status(200).json({
        success: true,
        message: "Recharge offer retrieved successfully",
        data: result,
    });
}));
const createRecharge = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const result = yield recharge_service_1.RechargeServices.createRecharge(req.body, userId);
    res.status(200).json({
        success: true,
        message: "Recharge request created successfully",
        data: result,
    });
}));
const getRecharge = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield recharge_service_1.RechargeServices.getRecharge(Object.assign(Object.assign({}, req.query), { userId: req.user.role === "ADMIN" ? undefined : req.user.id }));
    res.status(200).json({
        success: true,
        message: "Recharge requests retrieved successfully",
        data: result.data,
        meta: result.meta,
    });
}));
const cancelRecharge = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield recharge_service_1.RechargeServices.cancelRecharge(req.params.id);
    res.status(200).json({
        success: true,
        message: "Recharge requests cancelled successfully",
        data: result,
    });
}));
const manualRechargeSuccess = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield recharge_service_1.RechargeServices.manualRechargeSuccess(req.params.id);
    res.status(200).json({
        success: true,
        message: "Recharge requests marked as successful",
        data: result,
    });
}));
exports.RechargeController = {
    createRecharge,
    createOffer,
    deleteOffer,
    updateOffer,
    getAllOffers,
    createRechargeOffer,
    updateRechargeOffer,
    deleteRechargeOffer,
    getRechargeOffers,
    getRecharge,
    retryRecharge,
    cancelRecharge,
    manualRechargeSuccess,
    getRechargeOfferByAmount,
};
