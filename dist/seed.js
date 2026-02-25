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
exports.seed = void 0;
const prisma_1 = __importDefault(require("./shared/prisma"));
const seed = () => __awaiter(void 0, void 0, void 0, function* () {
    const admin = yield prisma_1.default.user.findFirst({
        where: { role: "ADMIN" },
    });
    if (!admin) {
        yield prisma_1.default.user.create({
            data: {
                name: "Admin",
                email: "admin@example.com",
                password: "12345678",
                role: "ADMIN",
                status: "ACTIVE",
                passwordChangedAt: new Date(Date.now() - 30 * 1000),
            },
        });
    }
    return { message: "Seeding completed successfully." };
});
exports.seed = seed;
