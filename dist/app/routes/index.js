"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_routes_1 = require("../modules/Auth/auth.routes");
const Site_route_1 = require("../modules/Site/Site.route");
const Payment_route_1 = require("../modules/Payment/Payment.route");
const Bank_route_1 = require("../modules/Bank/Bank.route");
const router = express_1.default.Router();
const moduleRoutes = [
    {
        path: "/auth",
        route: auth_routes_1.authRoutes,
    },
    {
        path: "/site",
        route: Site_route_1.SiteRoute,
    },
    {
        path: "/payment",
        route: Payment_route_1.PaymentRoute,
    },
    {
        path: "/bank",
        route: Bank_route_1.BankRoute,
    },
];
moduleRoutes.forEach((route) => router.use(route.path, route.route));
exports.default = router;
