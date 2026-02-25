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

export const SiteController = {
  createSite,
  updateSite,
  deleteSite,
  getAllSites,
  toggleSiteStatus,
};
