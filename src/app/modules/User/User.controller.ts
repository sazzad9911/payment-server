import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { UserService } from "./User.service";

/**
 * 🔹 Get user list (pagination + search)
 */
const getUserList = catchAsync(async (req: Request, res: Response) => {
  const { page, limit, search } = req.query;

  const result = await UserService.getUserList({
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
    search: search as string | undefined,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User list retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

/**
 * 🔹 Update user
 */
const updateUser = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;

  const result = await UserService.updateUser(userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User updated successfully",
    data: result,
  });
});

/**
 * 🔹 Toggle block / unblock user
 */
const toggleBlockUser = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;

  const result = await UserService.toggleBlockUser(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User status updated successfully",
    data: result,
  });
});
const addBalance = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.userId;

  const result = await UserService.addBalance(userId, req.body.amount);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Balance updated successfully",
    data: result,
  });
});
const cutBalance = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.userId;

  const result = await UserService.cutBalance(userId, req.body.amount);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Balance updated successfully",
    data: result,
  });
});
export const UserController = {
  getUserList,
  updateUser,
  toggleBlockUser,
  cutBalance,
  addBalance,
};
