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
exports.ContactService = void 0;
const ApiErrors_1 = __importDefault(require("../../../errors/ApiErrors"));
const generateFileUrl_1 = require("../../../helpars/generateFileUrl");
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const Contact_validation_1 = require("./Contact.validation");
const createContact = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.contact.create({
        data: payload,
    });
    return result;
});
const getAllContacts = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const { searchTerm, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;
    const whereCondition = {};
    if (searchTerm) {
        whereCondition.name = {
            contains: searchTerm,
        };
    }
    const contacts = yield prisma_1.default.contact.findMany({
        where: whereCondition,
        skip: Number(skip),
        take: Number(limit),
        orderBy: {
            createdAt: "desc",
        },
    });
    const total = yield prisma_1.default.contact.count({
        where: whereCondition,
    });
    return {
        meta: {
            page: Number(page),
            limit: Number(limit),
            total,
        },
        data: contacts,
    };
});
const createMerchant = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    const files = req.files;
    if (!(files === null || files === void 0 ? void 0 : files.trade) || !(files === null || files === void 0 ? void 0 : files.tin) || !(files === null || files === void 0 ? void 0 : files.nid) || !(files === null || files === void 0 ? void 0 : files.image)) {
        throw new ApiErrors_1.default(404, "All documents (trade, tin, nid, image) are required");
    }
    const tradeUrl = (0, generateFileUrl_1.generateFileUrl)(req, files.trade[0].path);
    const tinUrl = (0, generateFileUrl_1.generateFileUrl)(req, files.tin[0].path);
    const nidUrl = (0, generateFileUrl_1.generateFileUrl)(req, files.nid[0].path);
    const imageUrl = (0, generateFileUrl_1.generateFileUrl)(req, files.image[0].path);
    const payload = Object.assign(Object.assign({}, body), { trade_url: tradeUrl, tin_url: tinUrl, nid_url: nidUrl, image_url: imageUrl });
    const data = yield Contact_validation_1.ContactValidation.merchantSchema.parseAsync(payload);
    const result = yield prisma_1.default.merchant.create({
        data,
    });
    return result;
});
const getAllMerchant = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const { searchTerm, page = 1, limit = 10 } = query;
    const skip = (Number(page) - 1) * Number(limit);
    const whereCondition = {};
    if (searchTerm) {
        whereCondition.name = {
            contains: searchTerm,
        };
    }
    const merchants = yield prisma_1.default.merchant.findMany({
        where: whereCondition,
        skip,
        take: Number(limit),
        orderBy: {
            createdAt: "desc",
        },
    });
    const total = yield prisma_1.default.merchant.count({
        where: whereCondition,
    });
    return {
        meta: {
            page: Number(page),
            limit: Number(limit),
            total,
        },
        data: merchants,
    };
});
exports.ContactService = {
    getAllContacts,
    createContact,
    createMerchant,
    getAllMerchant,
};
