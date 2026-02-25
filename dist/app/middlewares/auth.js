"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("../../config"));
const http_status_1 = __importDefault(require("http-status"));
const ApiErrors_1 = __importDefault(require("../../errors/ApiErrors"));
const jwtHelpers_1 = require("../../helpars/jwtHelpers");
const prisma_1 = __importDefault(require("../../shared/prisma"));
const auth = (...roles) => {
    return (req, _res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            let token = req.headers.authorization;
            if (!token) {
                throw new ApiErrors_1.default(http_status_1.default.UNAUTHORIZED, "You are not authorized!");
            }
            // Remove "Bearer " prefix if present
            if (token.startsWith("Bearer ")) {
                token = token.split(" ")[1];
            }
            const verifiedUser = jwtHelpers_1.jwtHelpers.verifyToken(token, config_1.default.jwt.jwt_secret);
            const { id, role, uid, iat } = verifiedUser;
            const user = yield prisma_1.default.user.findUnique({
                where: {
                    id: id,
                },
            });
            if (!user) {
                throw new ApiErrors_1.default(http_status_1.default.NOT_FOUND, "User not found!");
            }
            if (user.activeTokenId !== uid && user.role !== "ADMIN") {
                throw new ApiErrors_1.default(http_status_1.default.UNAUTHORIZED, "User active at another device. Please log in again.");
            }
            if (user.status === "BLOCKED") {
                throw new ApiErrors_1.default(http_status_1.default.FORBIDDEN, "Your account is blocked!");
            }
            if (user.passwordChangedAt) {
                const passwordChangedAt = new Date(user.passwordChangedAt).getTime() / 1000;
                const tokenIssuedAt = iat; // iat is in seconds
                if (tokenIssuedAt && tokenIssuedAt < passwordChangedAt) {
                    return next(new ApiErrors_1.default(http_status_1.default.UNAUTHORIZED, "Token expired due to password change. Please log in again."));
                }
            }
            req.user = verifiedUser;
            if (roles.length && !roles.includes(verifiedUser.role)) {
                throw new ApiErrors_1.default(http_status_1.default.FORBIDDEN, "Forbidden!");
            }
            next();
        }
        catch (err) {
            next(err);
        }
    });
};
exports.default = auth;
