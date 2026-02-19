import { Request, Response } from "express";
import { BillService } from "./Bill.service";

/**
 * Create Bill Category
 */
const createBillCategory = async (req: Request, res: Response) => {
  const { title } = req.body;

  const result = await BillService.createBillCategory(title, req);

  res.status(201).json({
    success: true,
    message: "Bill category created successfully",
    data: result,
  });
};

/**
 * Delete Bill Category
 */
const deleteBillCategory = async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await BillService.deleteBillCategory(id);

  res.status(200).json({
    success: true,
    message: "Bill category deleted successfully",
    data: result,
  });
};

/**
 * Create Biller
 */
const createBiller = async (req: Request, res: Response) => {
  const { name, categoryId } = req.body;

  const result = await BillService.createBiller(name, categoryId, req);

  res.status(201).json({
    success: true,
    message: "Biller created successfully",
    data: result,
  });
};

/**
 * Delete Biller
 */
const deleteBiller = async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await BillService.deleteBiller(id);

  res.status(200).json({
    success: true,
    message: "Biller deleted successfully",
    data: result,
  });
};

/**
 * Create Bill History (Payment)
 */
const createBillHistory = async (req: Request, res: Response) => {
  const payload = req.body;
  const userId = req.user.id;

  const result = await BillService.createBillHistory(payload, userId);

  res.status(201).json({
    success: true,
    message: "Bill paid successfully",
    data: result,
  });
};
const getBillHistory = async (req: Request, res: Response) => {
  const { userId, page, limit } = req.query;

  const result = await BillService.getBillHistory({
    userId: (userId as string) || "",
    page: Number(page),
    limit: Number(limit),
  });

  res.status(200).json({
    success: true,
    message: "Bill history fetched successfully",
    ...result,
  });
};
const getBillCategory = async (req: Request, res: Response) => {
  const result = await BillService.getBillCategory();
  res.status(200).json({
    success: true,
    message: "Bill categories fetched successfully",
    data: result,
  });
};
const getBiller = async (req: Request, res: Response) => {
  const result = await BillService.getBiller(req.query);
  res.status(200).json({
    success: true,
    message: "Billers fetched successfully",
    data: result,
  });
};
const acceptBillPayment = async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await BillService.acceptBillPayment(id);

  res.status(200).json({
    success: true,
    message: "Bill payment accepted successfully",
    data: result,
  });
};
const rejectBillPayment = async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await BillService.rejectBillPayment(id);

  res.status(200).json({
    success: true,
    message: "Bill payment rejected and refunded successfully",
    data: result,
  });
};
export const BillController = {
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
