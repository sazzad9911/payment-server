import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { BankServices } from "./Bank.service";

// GET /banks
export const getAllBanksController = catchAsync(
  async (req: Request, res: Response) => {
    const result = await BankServices.getAllBanks();

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Banks fetched successfully",
      data: result,
    });
  },
);

// PATCH /banks/:id/toggle-status
export const toggleBankStatusController = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await BankServices.toggleBankStatus(id);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Bank status updated successfully",
      data: result,
    });
  },
);

// DELETE /banks/:id
export const deleteBankController = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await BankServices.deleteBank(id);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Bank deleted successfully",
      data: result,
    });
  },
);

export const BankControllers = {
  getAllBanksController,
  toggleBankStatusController,
  deleteBankController,
};
