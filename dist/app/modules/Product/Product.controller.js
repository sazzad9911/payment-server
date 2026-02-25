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
exports.ProductController = void 0;
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const Product_service_1 = require("./Product.service");
const addProduct = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield Product_service_1.ProductService.addProduct(req.body, req.files, req, req.user.id);
    res.status(201).json({
        success: true,
        message: "Product added successfully",
        data: result,
    });
}));
const updateProduct = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield Product_service_1.ProductService.updateProduct(id, req.body, req.files, req);
    res.status(200).json({
        success: true,
        message: "Product updated successfully",
        data: result,
    });
}));
const deleteProduct = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    yield Product_service_1.ProductService.deleteProduct(id);
    res.status(200).json({
        success: true,
        message: "Product deleted successfully",
    });
}));
const getProducts = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield Product_service_1.ProductService.getProducts(req.query);
    res.status(200).json({
        success: true,
        message: "Products retrieved successfully",
        meta: result.meta,
        data: result.data,
    });
}));
const getSingleProduct = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield Product_service_1.ProductService.getSingleProduct(id);
    res.status(200).json({
        success: true,
        message: "Product retrieved successfully",
        data: result,
    });
}));
const getAllCustomer = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield Product_service_1.ProductService.getAllCustomers(req.query, req.user.id);
    res.status(200).json({
        success: true,
        message: "Customers retrieved successfully",
        meta: result.meta,
        data: result.data,
    });
}));
const addCustomer = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield Product_service_1.ProductService.addCustomer(req.body, req.user.id);
    res.status(201).json({
        success: true,
        message: "Customer added successfully",
        data: result,
    });
}));
const updateCustomer = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield Product_service_1.ProductService.updateCustomer(req.body, id);
    res.status(200).json({
        success: true,
        message: "Customer updated successfully",
        data: result,
    });
}));
const deleteCustomer = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    yield Product_service_1.ProductService.deleteCustomer(id);
    res.status(200).json({
        success: true,
        message: "Customer deleted successfully",
    });
}));
const createSales = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield Product_service_1.ProductService.createSales(req.body, req.user.id);
    res.status(201).json({
        success: true,
        message: "Sales created successfully",
        data: result,
    });
}));
const updateSale = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield Product_service_1.ProductService.updateSale(id, req.body);
    res.status(201).json({
        success: true,
        message: "Sales updated successfully",
        data: result,
    });
}));
const getSales = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield Product_service_1.ProductService.getSales(req.query, req.user.id);
    res.status(200).json({
        success: true,
        message: "Sales retrieved successfully",
        meta: result.meta,
        data: result.data,
    });
}));
const toggleStockProduct = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield Product_service_1.ProductService.toggleStockProduct(id, req.user.id);
    res.status(200).json({
        success: true,
        message: "Stock updated!",
        data: result,
    });
}));
const deleteSale = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield Product_service_1.ProductService.deleteSale(id, req.user.id);
    res.status(200).json({
        success: true,
        message: "Sales deleted successfully",
        data: result,
    });
}));
const getUserSales = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield Product_service_1.ProductService.getUserSales(req.user.id);
    res.status(200).json({
        success: true,
        message: "User Sales fetched successfully",
        data: result,
    });
}));
exports.ProductController = {
    addProduct,
    updateProduct,
    deleteProduct,
    getProducts,
    getSingleProduct,
    addCustomer,
    getAllCustomer,
    updateCustomer,
    deleteCustomer,
    getSales,
    updateSale,
    createSales,
    toggleStockProduct,
    deleteSale,
    getUserSales,
};
