import express from "express";
import { authRoutes } from "../modules/Auth/auth.routes";
import { SiteRoute } from "../modules/Site/Site.route";
import { PaymentRoute } from "../modules/Payment/Payment.route";
import { BankRoute } from "../modules/Bank/Bank.route";

const router = express.Router();

const moduleRoutes = [
  {
    path: "/auth",
    route: authRoutes,
  },
  {
    path: "/site",
    route: SiteRoute,
  },
  {
    path: "/payment",
    route: PaymentRoute,
  },
  {
    path: "/bank",
    route: BankRoute,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
