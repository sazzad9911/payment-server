import express from "express";
import auth from "../../middlewares/auth";
import { RechargeController } from "./recharge.controller";
import validateRequest from "../../middlewares/validateRequest";
import { RechargeSchema } from "./recharge.validation";

const router = express.Router();

router.post("/offer", auth("ADMIN"), RechargeController.createOffer);
router.delete("/offer/:offerId", auth("ADMIN"), RechargeController.deleteOffer);
router.put("/offer/:offerId", auth("ADMIN"), RechargeController.updateOffer);
router.get("/offer", RechargeController.getAllOffers);
router.post(
  "/recharge-offer",
  auth("ADMIN"),
  validateRequest(RechargeSchema.rechargeOfferSchema),
  RechargeController.createRechargeOffer,
);
router.put(
  "/recharge-offer/:id",
  auth("ADMIN"),
  validateRequest(RechargeSchema.rechargeOfferSchema.partial()),
  RechargeController.updateRechargeOffer,
);
router.delete(
  "/recharge-offer/:id",
  auth("ADMIN"),
  RechargeController.deleteRechargeOffer,
);
router.get("/recharge-offer", RechargeController.getRechargeOffers);
router.patch(
  "/retry-recharge/:id",
  auth("ADMIN"),
  RechargeController.retryRecharge,
);
router.patch(
  "/cancel-recharge/:id",
  auth("ADMIN"),
  RechargeController.cancelRecharge,
);
router.patch(
  "/manual-recharge-success/:id",
  auth("ADMIN"),
  RechargeController.manualRechargeSuccess,
);
router.post(
  "/",
  auth(),
  validateRequest(RechargeSchema.rechargeSchema),
  RechargeController.createRecharge,
);
router.get("/", auth(), RechargeController.getRecharge);
export const RechargeRoutes = router;
