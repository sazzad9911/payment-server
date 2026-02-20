import express from "express";
import { authRoutes } from "../modules/Auth/auth.routes";
import { RechargeRoutes } from "../modules/Recharge/recharge.routes";
import { ProductRoutes } from "../modules/Product/Product.routes";
import { BalanceRoutes } from "../modules/Balance/Balance.routes";
import { PackageRoutes } from "../modules/Package/Package.routes";
import { UserRoute } from "../modules/User/User.route";
import { ChatRoutes } from "../modules/chat/Chat.routes";
import { SystemRoutes } from "../modules/System/System.routes";
import { BillRoutes } from "../modules/Bill/Bill.routes";

const router = express.Router();

const moduleRoutes = [
  {
    path: "/auth",
    route: authRoutes,
  },
  {
    path: "/user",
    route: UserRoute,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
