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
exports.userEvents = void 0;
const prisma_1 = __importDefault(require("../../shared/prisma"));
const zod_1 = require("zod");
const parseSMS_1 = require("../../helpars/parseSMS");
const registerDeviceZodSchema = zod_1.z.array(zod_1.z.object({
    number: zod_1.z
        .string()
        .regex(/^01\d{9}$/, "Number must be 11 digits and start with 01"),
    sim: zod_1.z.number().int(),
    type: zod_1.z.enum(["SEND_MONEY", "CASH_OUT", "PAYMENT"]),
    bank: zod_1.z.enum(["BKASH", "NAGAD", "ROCKET", "UPAY"]),
}));
const idSchema = zod_1.z.string().min(1);
const call_schema = zod_1.z.array(zod_1.z.object({
    MSISDN: zod_1.z.string(),
    text: zod_1.z.string(),
    paymentId: zod_1.z.string().uuid(),
}));
const userEvents = (socket, io) => {
    socket.on("register_device", (payload) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            // Accept either JSON string or object/array
            const raw = typeof payload === "string" ? JSON.parse(payload) : payload;
            const parsed = registerDeviceZodSchema.safeParse(raw);
            if (!parsed.success) {
                return io.to(socket.id).emit("register_failed", {
                    message: "Validation failed",
                    issues: parsed.error.issues,
                });
            }
            const results = yield Promise.all(parsed.data.map((d) => prisma_1.default.mobile_banks.upsert({
                where: {
                    number_bank_type: {
                        number: d.number,
                        type: d.type,
                        bank: d.bank,
                    },
                },
                create: {
                    number: d.number,
                    sim: d.sim,
                    type: d.type,
                    bank: d.bank,
                    socketId: socket.id,
                    isActive: true,
                    // only keep this if you DON'T have @updatedAt
                    updatedAt: new Date(),
                },
                update: {
                    socketId: socket.id,
                    isActive: true,
                    sim: d.sim,
                    type: d.type,
                    bank: d.bank,
                    updatedAt: new Date(), // only if no @updatedAt
                },
            })));
            io.to(socket.id).emit("register_success", results);
        }
        catch (err) {
            // JSON.parse error or prisma error
            console.error("register_device error:", err);
            io.to(socket.id).emit("register_failed", {
                message: "Registration failed",
                error: (_a = err === null || err === void 0 ? void 0 : err.message) !== null && _a !== void 0 ? _a : "Unknown error",
            });
        }
    }));
    socket.on("call_device", (paymentId) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const payment = yield prisma_1.default.payment_list.findUnique({
                where: { id: paymentId },
                include: { bank: true },
            });
            io.to(socket.id).emit("payment", payment);
        }
        catch (e) {
            console.error("call_device error:", e);
            return io.to(socket.id).emit("call_failed", {
                message: "Failed to call device",
                error: (_a = e === null || e === void 0 ? void 0 : e.message) !== null && _a !== void 0 ? _a : "Unknown error",
            });
        }
    }));
    socket.on("message_list", (payload) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const raw = typeof payload === "string" ? JSON.parse(payload) : payload;
            const parsed = yield call_schema.parseAsync(raw);
            const payment = yield prisma_1.default.payment_list.findUnique({
                where: { id: parsed[0].paymentId },
                include: { bank: true },
            });
            if (!payment) {
                return io.to(socket.id).emit("message_list_failed", {
                    message: "Payment not found",
                });
            }
            if (payment.bank.bank === "BKASH") {
                const isValid = parsed.some((sms) => (0, parseSMS_1.validateBkashPayment)(sms.text, payment.amount, payment.tnx_id, sms.MSISDN));
                if (!isValid) {
                    yield prisma_1.default.payment_list.update({
                        where: { id: payment.id },
                        data: { status: "FAILED" },
                    });
                    return io.to(socket.id).emit("message_list_failed", {
                        message: "Payment validation failed",
                    });
                }
            }
            if (payment.bank.bank === "NAGAD") {
                const isValid = parsed.some((sms) => (0, parseSMS_1.validateNagadPayment)(sms.text, payment.amount, payment.tnx_id, sms.MSISDN));
                if (!isValid) {
                    yield prisma_1.default.payment_list.update({
                        where: { id: payment.id },
                        data: { status: "FAILED" },
                    });
                    return io.to(socket.id).emit("message_list_failed", {
                        message: "Payment validation failed",
                    });
                }
            }
            yield prisma_1.default.payment_list.update({
                where: { id: payment.id },
                data: { status: "SUCCESS" },
            });
            io.to(socket.id).emit("message_list_success", parsed);
        }
        catch (error) {
            console.error("message_list error:", error);
            io.to(socket.id).emit("message_list_failed", {
                message: "Failed to process message list",
                error: (_a = error === null || error === void 0 ? void 0 : error.message) !== null && _a !== void 0 ? _a : "Unknown error",
            });
        }
    }));
    // ✅ recommended: mark inactive when socket disconnects
    socket.on("disconnect", () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield prisma_1.default.mobile_banks.updateMany({
                where: { socketId: socket.id },
                data: { isActive: false },
            });
        }
        catch (e) {
            console.error("disconnect updateMany error:", e);
        }
    }));
};
exports.userEvents = userEvents;
