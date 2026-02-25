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
exports.BankServices = void 0;
const ApiErrors_1 = __importDefault(require("../../../errors/ApiErrors"));
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const getAllBanks = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.mobile_banks.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            _count: {
                select: {
                    paymentLists: true,
                },
            },
        },
    });
    return result;
});
const toggleBankStatus = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const bank = yield prisma_1.default.mobile_banks.findUnique({
        where: { id },
    });
    if (!bank) {
        throw new ApiErrors_1.default(404, "Bank not found");
    }
    const updatedBank = yield prisma_1.default.mobile_banks.update({
        where: { id },
        data: { status: bank.status == "ACTIVE" ? "BLOCKED" : "ACTIVE" },
    });
    return updatedBank;
});
const deleteBank = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const bank = yield prisma_1.default.mobile_banks.findUnique({
        where: { id },
    });
    if (!bank) {
        throw new ApiErrors_1.default(404, "Bank not found");
    }
    yield prisma_1.default.mobile_banks.delete({
        where: { id },
    });
    return { message: "Bank deleted successfully" };
});
exports.BankServices = {
    getAllBanks,
    toggleBankStatus,
    deleteBank,
};
