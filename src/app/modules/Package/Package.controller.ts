import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { PackageService } from "./Package.service";

/**
 * Create
 */
const createPackage = catchAsync(async (req: Request, res: Response) => {
  const result = await PackageService.createPackage(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Package created successfully",
    data: result,
  });
});

/**
 * Get All
 */
const getAllPackages = catchAsync(async (_req, res) => {
  const result = await PackageService.getAllPackages();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Packages retrieved successfully",
    data: result,
  });
});

/**
 * Get One
 */
const getPackageById = catchAsync(async (req, res) => {
  const result = await PackageService.getPackageById(req.params.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Package retrieved successfully",
    data: result,
  });
});

/**
 * Update
 */
const updatePackage = catchAsync(async (req, res) => {
  const result = await PackageService.updatePackage(req.params.id, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Package updated successfully",
    data: result,
  });
});

/**
 * Delete
 */
const deletePackage = catchAsync(async (req, res) => {
  await PackageService.deletePackage(req.params.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Package deleted successfully",
  });
});
const buyPackage = catchAsync(async (req, res) => {
  const result = await PackageService.buyPackage(req.user.id, req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Package updated successfully",
    data: result,
  });
});
const updateSettings = catchAsync(async (req: Request, res: Response) => {
  const result = await PackageService.updateSettings(req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    data: result,
    message: "Update successful",
  });
});
const getSettings = catchAsync(async (req: Request, res: Response) => {
  const result = await PackageService.getSettings();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    data: result,
    message: "Fetched successful",
  });
});
export const PackageController = {
  deletePackage,
  getPackageById,
  getAllPackages,
  updatePackage,
  createPackage,
  buyPackage,
  updateSettings,
  getSettings,
};
