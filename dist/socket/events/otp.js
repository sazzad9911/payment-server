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
exports.otpEvents = void 0;
const prisma_1 = __importDefault(require("../../shared/prisma"));
const otpEvents = (socket, io) => {
    socket.on("otp:success", (id) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            console.log(id, "OTP success");
            yield prisma_1.default.otpCodes.update({
                where: { id },
                data: { isSuccess: true },
            });
            io.emit("otp:success", { id: id });
        }
        catch (err) {
            console.error("Failed to update OTP:", err);
            socket.emit("otp:error", { message: "Failed to update OTP", id: id });
        }
    }));
    socket.on("otp:failed", (id) => {
        console.log(id, "OTP failed");
        io.emit("otp:failed", { id: id });
    });
};
exports.otpEvents = otpEvents;
