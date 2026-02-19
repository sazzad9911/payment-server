import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { ProductService } from "./Product.service";

const addProduct = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductService.addProduct(
    req.body,
    req.files as Express.Multer.File[],
    req,
    req.user.id,
  );

  res.status(201).json({
    success: true,
    message: "Product added successfully",
    data: result,
  });
});

const updateProduct = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await ProductService.updateProduct(
    id,
    req.body,
    req.files as Express.Multer.File[],
    req,
  );

  res.status(200).json({
    success: true,
    message: "Product updated successfully",
    data: result,
  });
});

const deleteProduct = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  await ProductService.deleteProduct(id);

  res.status(200).json({
    success: true,
    message: "Product deleted successfully",
  });
});

const getProducts = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductService.getProducts(req.query);

  res.status(200).json({
    success: true,
    message: "Products retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getSingleProduct = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await ProductService.getSingleProduct(id);

  res.status(200).json({
    success: true,
    message: "Product retrieved successfully",
    data: result,
  });
});
const getAllCustomer = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductService.getAllCustomers(req.query, req.user.id);

  res.status(200).json({
    success: true,
    message: "Customers retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});
const addCustomer = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductService.addCustomer(req.body, req.user.id);

  res.status(201).json({
    success: true,
    message: "Customer added successfully",
    data: result,
  });
});
const updateCustomer = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await ProductService.updateCustomer(req.body, id);

  res.status(200).json({
    success: true,
    message: "Customer updated successfully",
    data: result,
  });
});
const deleteCustomer = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  await ProductService.deleteCustomer(id);

  res.status(200).json({
    success: true,
    message: "Customer deleted successfully",
  });
});
const createSales = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductService.createSales(req.body, req.user.id);
  res.status(201).json({
    success: true,
    message: "Sales created successfully",
    data: result,
  });
});
const updateSale = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ProductService.updateSale(id, req.body);
  res.status(201).json({
    success: true,
    message: "Sales updated successfully",
    data: result,
  });
});
const getSales = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductService.getSales(req.query, req.user.id);
  res.status(200).json({
    success: true,
    message: "Sales retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});
const toggleStockProduct = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ProductService.toggleStockProduct(id, req.user.id);
  res.status(200).json({
    success: true,
    message: "Stock updated!",
    data: result,
  });
});
const deleteSale = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ProductService.deleteSale(id, req.user.id);
  res.status(200).json({
    success: true,
    message: "Sales deleted successfully",
    data: result,
  });
});
const getUserSales = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductService.getUserSales(req.user.id);
  res.status(200).json({
    success: true,
    message: "User Sales fetched successfully",
    data: result,
  });
});
export const ProductController = {
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
