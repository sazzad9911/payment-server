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
const registerDeviceZodSchema = zod_1.z.array(zod_1.z.object({
    number: zod_1.z
        .string()
        .regex(/^01\d{9}$/, "Number must be 11 digits and start with 01"),
    sim: zod_1.z.number().int(),
    type: zod_1.z.enum(["SEND_MONEY", "CASH_OUT", "PAYMENT"]),
    bank: zod_1.z.enum(["BKASH", "NAGAD", "ROCKET", "UPAY"]),
}));
const idSchema = zod_1.z.string().min(1);
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
    socket.on("payment_success", (id) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const parsed = idSchema.safeParse(id);
            if (!parsed.success)
                return;
            yield prisma_1.default.payment_list.update({
                where: { id: parsed.data },
                data: { status: "SUCCESS" },
            });
            // optional ack
            // socket.emit("payment_status_updated", { id: parsed.data, status: "SUCCESS" });
        }
        catch (error) {
            console.error("payment_success error:", (_a = error === null || error === void 0 ? void 0 : error.message) !== null && _a !== void 0 ? _a : error);
        }
    }));
    socket.on("payment_failed", (id) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const parsed = idSchema.safeParse(id);
            if (!parsed.success)
                return;
            yield prisma_1.default.payment_list.update({
                where: { id: parsed.data },
                data: { status: "FAILED" },
            });
        }
        catch (error) {
            console.error("payment_failed error:", (_a = error === null || error === void 0 ? void 0 : error.message) !== null && _a !== void 0 ? _a : error);
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
