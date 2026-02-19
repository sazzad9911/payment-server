import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { SystemService } from "./System.service";
import sendResponse from "../../../shared/sendResponse";

const getSimInfos = catchAsync(async (req: Request, res: Response) => {
  const result = await SystemService.getSimInfos();

  res.status(200).json({
    success: true,
    data: result,
  });
});

const updateUssdCode = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { code } = req.body;

  const result = await SystemService.updateUssdCode(code, id);

  res.status(200).json({
    success: true,
    message: "USSD code updated successfully",
    data: result,
  });
});

const toggleActiveOTPSim = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await SystemService.toggleActiveOTPSim(id);

  res.status(200).json({
    success: true,
    message: "OTP SIM status updated",
    data: result,
  });
});
const getContacts = catchAsync(async (req: Request, res: Response) => {
  const result = await SystemService.getContacts(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Contacts fetched successful!",
    data: result.data,
    meta: result.meta,
  });
});
const makeContact = catchAsync(async (req: Request, res: Response) => {
  const result = await SystemService.makeContact(req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Contact created!",
    data: result,
  });
});
const createBanner = catchAsync(async (req: Request, res: Response) => {
  const result = await SystemService.createBanner(
    req,
    req.file as Express.Multer.File,
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Banner created!",
    data: result,
  });
});
const getBanner = catchAsync(async (req: Request, res: Response) => {
  const result = await SystemService.getBanner();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Banner fetched!",
    data: result,
  });
});
const deleteBanner = catchAsync(async (req: Request, res: Response) => {
  const result = await SystemService.deleteBanner(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Banner deleted!",
    data: result,
  });
});
const userOverview = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const sort = (req.query.sort as "day" | "month" | "year") || "day";

  const result = await SystemService.userOverview(userId, sort);

  res.status(200).json({
    success: true,
    message: "User overview retrieved successfully",
    data: result,
  });
});

/**
 * ADMIN OVERVIEW
 * GET /api/overview/admin
 */
const adminOverview = catchAsync(async (_req: Request, res: Response) => {
  const sort = (_req.query.sort as "day" | "month" | "year") || "day";
  const result = await SystemService.adminOverview(sort);

  res.status(200).json({
    success: true,
    message: "Admin overview retrieved successfully",
    data: result,
  });
});

export const SystemController = {
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
