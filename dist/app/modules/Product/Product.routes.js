"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductRoutes = void 0;
const express_1 = __importDefault(require("express"));
const fileUploader_1 = require("../../../helpars/fileUploader");
const Product_controller_1 = require("./Product.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const Product_validation_1 = require("./Product.validation");
const router = express_1.default.Router();
router.get("/customers", (0, auth_1.default)(), Product_controller_1.ProductController.getAllCustomer);
router.post("/customers", (0, auth_1.default)(), (0, validateRequest_1.default)(Product_validation_1.ProductValidation.CustomerSchema), Product_controller_1.ProductController.addCustomer);
router.patch("/customers/:id", (0, auth_1.default)(), (0, validateRequest_1.default)(Product_validation_1.ProductValidation.CustomerSchema.partial()), Product_controller_1.ProductController.updateCustomer);
router.delete("/customers/:id", (0, auth_1.default)(), Product_controller_1.ProductController.deleteCustomer);
//sales
router.post("/sales", (0, auth_1.default)(), (0, validateRequest_1.default)(Product_validation_1.ProductValidation.SalesSchema), Product_controller_1.ProductController.createSales);
router.get("/sales", (0, auth_1.default)(), Product_controller_1.ProductController.getSales);
router.get("/sale/user", (0, auth_1.default)(), Product_controller_1.ProductController.getUserSales);
router.patch("/sales/:id", (0, auth_1.default)(), (0, validateRequest_1.default)(Product_validation_1.ProductValidation.SaleUpdateSchema), Product_controller_1.ProductController.updateSale);
router.delete("/sales/:id", (0, auth_1.default)(), Product_controller_1.ProductController.deleteSale);
router.get("/toggle-stock-product/:id", (0, auth_1.default)(), Product_controller_1.ProductController.toggleStockProduct);
// ➕ Add product
router.post("/", (0, auth_1.default)(), fileUploader_1.fileUploader.upload.array("images", 5), Product_controller_1.ProductController.addProduct);
// ✏️ Update product (keep/delete images handled in service)
router.patch("/:id", (0, auth_1.default)(), fileUploader_1.fileUploader.upload.array("newImages", 5), Product_controller_1.ProductController.updateProduct);
// ❌ Delete product (DB + image files)
router.delete("/:id", (0, auth_1.default)(), Product_controller_1.ProductController.deleteProduct);
// 📦 Get all products (pagination + search)
router.get("/", (0, auth_1.default)(), Product_controller_1.ProductController.getProducts);
// 🔍 Get single product
router.get("/:id", (0, auth_1.default)(), Product_controller_1.ProductController.getSingleProduct);
exports.ProductRoutes = router;
