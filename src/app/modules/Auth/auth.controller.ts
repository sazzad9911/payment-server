import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { AuthServices } from "./auth.service";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";

// register user
const registerUser = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthServices.registerUser(req.body);
  res.cookie("token", result.token, { httpOnly: true });
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User registered successfully",
    data: result,
  });
});
//send otp
const sendOtp = catchAsync(async (req: Request, res: Response) => {
  const { key } = req.query;
  const isReset = key == "reset";
  const result = await AuthServices.sendOTP(req.body, isReset);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "OTP send successfully",
    data: result,
  });
});
//verify otp
const verifyOtp = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthServices.validateOtp(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "OTP verified successfully",
    data: result,
  });
});
// login user
const loginUser = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthServices.loginUser(req.body);
  res.cookie("token", result.token, { httpOnly: true });
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: (result as any)?.message || "User logged in successfully",
    data: result,
  });
});

// logout user
const logoutUser = catchAsync(async (req: Request, res: Response) => {
  // Clear the token cookie
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User Successfully logged out",
    data: null,
  });
});

// change password
const changePassword = catchAsync(async (req: Request, res: Response) => {
  const userToken = req.headers.authorization;
  const { oldPassword, newPassword } = req.body;
  const result = await AuthServices.changePassword(
    userToken as string,
    newPassword,
    oldPassword,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Password changed successfully",
    data: result.token,
  });
});

// forgot password
const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  const { otpId, password } = req.body;
  await AuthServices.forgotPassword(otpId, password);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Reset password link is sent to your email. Check your email!",
    data: null,
  });
});

// reset password
const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const token = req.headers.authorization || "";

  await AuthServices.resetPassword(token, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Password Reset!",
    data: null,
  });
});
const checkAuth = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  const result = await AuthServices.checkAuth(userId as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User authenticated successfully",
    data: result,
  });
});
const updateToken = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  const result = await AuthServices.updateToken(
    userId as string,
    req.body.token,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User token updated successfully",
    data: result,
  });
});
export const AuthController = {
  registerUser,
  loginUser,
  logoutUser,
  changePassword,
  forgotPassword,
  resetPassword,
  checkAuth,
  sendOtp,
  verifyOtp,
  updateToken,
};
