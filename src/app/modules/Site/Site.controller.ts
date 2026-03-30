import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { SiteService } from "./Site.service";

const createSite = catchAsync(async (req: Request, res: Response) => {
  const result = await SiteService.createSite(req);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Site created successfully",
    data: result,
  });
});

const updateSite = catchAsync(async (req: Request, res: Response) => {
  const result = await SiteService.updateSite(req);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Site updated successfully",
    data: result,
  });
});

const deleteSite = catchAsync(async (req: Request, res: Response) => {
  const result = await SiteService.deleteSite(req);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Site deleted successfully",
    data: result,
  });
});

const getAllSites = catchAsync(async (req: Request, res: Response) => {
  const result = await SiteService.getAllSites(req);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Site list retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const toggleSiteStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await SiteService.toggleSiteStatus(req);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Site status updated successfully",
    data: result,
  });
});
const getDashboardInfo = catchAsync(async (req: Request, res: Response) => {
  const result = await SiteService.getDashboardInfo();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Analytics fetched successful",
    data: result,
  });
});
const getAllWithdraws = catchAsync(async (req: Request, res: Response) => {
  const result = await SiteService.getAllWithdraws(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Withdraws fetched successfully",
    data: result,
  });
});
const createWithdraw = catchAsync(async (req: Request, res: Response) => {
  const result = await SiteService.createWithdraw(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Withdraws created successfully",
    data: result,
  });
});
const acceptWithdraw = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await SiteService.acceptWithdraw(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Withdraw accepted successfully",
    data: result,
  });
});
const cancelWithdraw = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await SiteService.cancelWithdraw(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Withdraw cancelled successfully",
    data: result,
  });
});
export const SiteController = {
  createSite,
  updateSite,
  deleteSite,
  getAllSites,
  toggleSiteStatus,
  getDashboardInfo,
  cancelWithdraw,
  acceptWithdraw,
  getAllWithdraws,
  createWithdraw,
};
