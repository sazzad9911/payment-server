import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { RechargeServices } from "./recharge.service";

const createOffer = catchAsync(async (req: Request, res: Response) => {
  const { name } = req.body;
  const result = await RechargeServices.createOffer(name);
  res.status(200).json({
    success: true,
    message: "Offer created successfully",
    data: result,
  });
});
const retryRecharge = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await RechargeServices.retryRecharge(id);
  res.status(200).json({
    success: true,
    message: "Recharge request send successfully",
    data: result,
  });
});
const deleteOffer = catchAsync(async (req: Request, res: Response) => {
  const { offerId } = req.params;
  const result = await RechargeServices.deleteOffer(offerId);
  res.status(200).json({
    success: true,
    message: "Offer deleted successfully",
    data: result,
  });
});
const updateOffer = catchAsync(async (req: Request, res: Response) => {
  const { offerId } = req.params;
  const { name } = req.body;
  const result = await RechargeServices.updateOffer(offerId, name);
  res.status(200).json({
    success: true,
    message: "Offer updated successfully",
    data: result,
  });
});

const getAllOffers = catchAsync(async (req: Request, res: Response) => {
  const result = await RechargeServices.getAllOffers();
  res.status(200).json({
    success: true,
    message: "Offers retrieved successfully",
    data: result,
  });
});
const createRechargeOffer = catchAsync(async (req: Request, res: Response) => {
  const result = await RechargeServices.createRechargeOffer(req.body);
  res.status(200).json({
    success: true,
    message: "Recharge offer created successfully",
    data: result,
  });
});
const updateRechargeOffer = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await RechargeServices.updateRechargeOffer(id, req.body);
  res.status(200).json({
    success: true,
    message: "Recharge offer updated successfully",
    data: result,
  });
});
const deleteRechargeOffer = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await RechargeServices.deleteRechargeOffer(id);
  res.status(200).json({
    success: true,
    message: "Recharge offer deleted successfully",
    data: result,
  });
});
const getRechargeOffers = catchAsync(async (req: Request, res: Response) => {
  const result = await RechargeServices.getRechargeOffers(req.query);
  res.status(200).json({
    success: true,
    message: "Recharge offers retrieved successfully",
    data: result,
  });
});
const getRechargeOfferByAmount = catchAsync(
  async (req: Request, res: Response) => {
    const result = await RechargeServices.getRechargeOfferByAmount(req.query);
    res.status(200).json({
      success: true,
      message: "Recharge offer retrieved successfully",
      data: result,
    });
  },
);
const createRecharge = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const result = await RechargeServices.createRecharge(req.body, userId);
  res.status(200).json({
    success: true,
    message: "Recharge request created successfully",
    data: result,
  });
});
const getRecharge = catchAsync(async (req: Request, res: Response) => {
  const result = await RechargeServices.getRecharge({
    ...req.query,
    userId: req.user.role === "ADMIN" ? undefined : req.user.id,
  });
  res.status(200).json({
    success: true,
    message: "Recharge requests retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});
const cancelRecharge = catchAsync(async (req: Request, res: Response) => {
  const result = await RechargeServices.cancelRecharge(req.params.id);
  res.status(200).json({
    success: true,
    message: "Recharge requests cancelled successfully",
    data: result,
  });
});
const manualRechargeSuccess = catchAsync(
  async (req: Request, res: Response) => {
    const result = await RechargeServices.manualRechargeSuccess(req.params.id);
    res.status(200).json({
      success: true,
      message: "Recharge requests marked as successful",
      data: result,
    });
  },
);
export const RechargeController = {
  createRecharge,
  createOffer,
  deleteOffer,
  updateOffer,
  getAllOffers,
  createRechargeOffer,
  updateRechargeOffer,
  deleteRechargeOffer,
  getRechargeOffers,
  getRecharge,
  retryRecharge,
  cancelRecharge,
  manualRechargeSuccess,
  getRechargeOfferByAmount,
};
