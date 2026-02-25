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
exports.PackageService = void 0;
const ApiErrors_1 = __importDefault(require("../../../errors/ApiErrors"));
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const createPackage = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.packages.create({
        data: Object.assign({}, payload),
    });
    return result;
});
const getAllPackages = () => __awaiter(void 0, void 0, void 0, function* () {
    return prisma_1.default.packages.findMany({
        orderBy: { name: "asc" },
    });
});
const getPackageById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.packages.findUnique({ where: { id } });
    if (!result)
        throw new ApiErrors_1.default(404, "Package not found");
    return result;
});
const updatePackage = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    yield getPackageById(id);
    return prisma_1.default.packages.update({
        where: { id },
        data: payload,
    });
});
/**
 * Delete Package
 */
const deletePackage = (id) => __awaiter(void 0, void 0, void 0, function* () {
    yield getPackageById(id);
    return prisma_1.default.packages.delete({
        where: { id },
    });
});
const buyPackage = (userId, packageId) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        // 1️⃣ User
        const user = yield tx.user.findUnique({
            where: { id: userId },
            select: { id: true, balance: true },
        });
        if (!user)
            throw new ApiErrors_1.default(404, "User not found");
        // 2️⃣ Package
        const thePackage = yield tx.packages.findUnique({
            where: { id: packageId },
        });
        if (!thePackage)
            throw new ApiErrors_1.default(404, "Package not found");
        // 3️⃣ Already bought check
        const alreadyBought = yield tx.package_buyers.findFirst({
            where: {
                userId,
                packageId,
            },
        });
        if (alreadyBought) {
            throw new ApiErrors_1.default(409, "Package already purchased");
        }
        // 4️⃣ Balance check
        if (user.balance < thePackage.price) {
            throw new ApiErrors_1.default(400, "Low balance, please add balance");
        }
        // 5️⃣ Create buyer record
        yield tx.package_buyers.create({
            data: {
                userId,
                packageId,
            },
        });
        // 6️⃣ Deduct balance (atomic)
        yield tx.user.update({
            where: { id: userId },
            data: {
                balance: {
                    decrement: thePackage.price,
                },
            },
        });
        return {
            success: true,
            message: "Package purchased successfully",
        };
    }));
});
const updateSettings = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const settings = yield prisma_1.default.settings.findFirst();
    let result;
    if (!settings) {
        result = yield prisma_1.default.settings.create({
            data: Object.assign({}, payload),
        });
    }
    else {
        result = yield prisma_1.default.settings.update({
            where: { id: settings.id },
            data: Object.assign({}, payload),
        });
    }
    return result;
});
const getSettings = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.settings.findFirst();
    return result;
});
exports.PackageService = {
    createPackage,
    getAllPackages,
    getPackageById,
    updatePackage,
    deletePackage,
    buyPackage,
    updateSettings,
    getSettings,
};
