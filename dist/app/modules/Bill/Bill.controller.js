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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillController = void 0;
const Bill_service_1 = require("./Bill.service");
/**
 * Create Bill Category
 */
const createBillCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title } = req.body;
    const result = yield Bill_service_1.BillService.createBillCategory(title, req);
    res.status(201).json({
        success: true,
        message: "Bill category created successfully",
        data: result,
    });
});
/**
 * Delete Bill Category
 */
const deleteBillCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield Bill_service_1.BillService.deleteBillCategory(id);
    res.status(200).json({
        success: true,
        message: "Bill category deleted successfully",
        data: result,
    });
});
/**
 * Create Biller
 */
const createBiller = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, categoryId } = req.body;
    const result = yield Bill_service_1.BillService.createBiller(name, categoryId, req);
    res.status(201).json({
        success: true,
        message: "Biller created successfully",
        data: result,
    });
});
/**
 * Delete Biller
 */
const deleteBiller = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield Bill_service_1.BillService.deleteBiller(id);
    res.status(200).json({
        success: true,
        message: "Biller deleted successfully",
        data: result,
    });
});
/**
 * Create Bill History (Payment)
 */
const createBillHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const payload = req.body;
    const userId = req.user.id;
    const result = yield Bill_service_1.BillService.createBillHistory(payload, userId);
    res.status(201).json({
        success: true,
        message: "Bill paid successfully",
        data: result,
    });
});
const getBillHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, page, limit } = req.query;
    const result = yield Bill_service_1.BillService.getBillHistory({
        userId: userId || "",
        page: Number(page),
        limit: Number(limit),
    });
    res.status(200).json(Object.assign({ success: true, message: "Bill history fetched successfully" }, result));
});
const getBillCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield Bill_service_1.BillService.getBillCategory();
    res.status(200).json({
        success: true,
        message: "Bill categories fetched successfully",
        data: result,
    });
});
const getBiller = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield Bill_service_1.BillService.getBiller(req.query);
    res.status(200).json({
        success: true,
        message: "Billers fetched successfully",
        data: result,
    });
});
const acceptBillPayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield Bill_service_1.BillService.acceptBillPayment(id);
    res.status(200).json({
        success: true,
        message: "Bill payment accepted successfully",
        data: result,
    });
});
const rejectBillPayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield Bill_service_1.BillService.rejectBillPayment(id);
    res.status(200).json({
        success: true,
        message: "Bill payment rejected and refunded successfully",
        data: result,
    });
});
exports.BillController = {
    createBillCategory,
    deleteBillCategory,
    createBiller,
    deleteBiller,
    createBillHistory,
    getBillHistory,
    getBillCategory,
    getBiller,
    acceptBillPayment,
    rejectBillPayment,
};
