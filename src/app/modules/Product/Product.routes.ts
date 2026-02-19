import express from "express";
import { fileUploader } from "../../../helpars/fileUploader";
import { ProductController } from "./Product.controller";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { ProductValidation } from "./Product.validation";

const router = express.Router();

router.get("/customers", auth(), ProductController.getAllCustomer);
router.post(
  "/customers",
  auth(),
  validateRequest(ProductValidation.CustomerSchema),
  ProductController.addCustomer,
);
router.patch(
  "/customers/:id",
  auth(),
  validateRequest(ProductValidation.CustomerSchema.partial()),
  ProductController.updateCustomer,
);
router.delete("/customers/:id", auth(), ProductController.deleteCustomer);

//sales
router.post(
  "/sales",
  auth(),
  validateRequest(ProductValidation.SalesSchema),
  ProductController.createSales,
);
router.get("/sales", auth(), ProductController.getSales);
router.get("/sale/user", auth(), ProductController.getUserSales);
router.patch(
  "/sales/:id",
  auth(),
  validateRequest(ProductValidation.SaleUpdateSchema),
  ProductController.updateSale,
);
router.delete("/sales/:id", auth(), ProductController.deleteSale);

router.get(
  "/toggle-stock-product/:id",
  auth(),
  ProductController.toggleStockProduct,
);
// ➕ Add product
router.post(
  "/",
  auth(),
  fileUploader.upload.array("images", 5),
  ProductController.addProduct,
);

// ✏️ Update product (keep/delete images handled in service)
router.patch(
  "/:id",
  auth(),
  fileUploader.upload.array("newImages", 5),
  ProductController.updateProduct,
);

// ❌ Delete product (DB + image files)
router.delete("/:id", auth(), ProductController.deleteProduct);

// 📦 Get all products (pagination + search)
router.get("/", auth(), ProductController.getProducts);

// 🔍 Get single product
router.get("/:id", auth(), ProductController.getSingleProduct);

export const ProductRoutes = router;
