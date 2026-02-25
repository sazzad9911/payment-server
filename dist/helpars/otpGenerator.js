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
exports.otpGenerator = void 0;
exports.generate6DigitCode = generate6DigitCode;
const ApiErrors_1 = __importDefault(require("../errors/ApiErrors"));
const nodemailer_1 = __importDefault(require("nodemailer"));
function generate6DigitCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}
const otpGenerator = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const otp = generate6DigitCode();
    if (!process.env.EMAIL || !process.env.APP_PASS) {
        throw new ApiErrors_1.default(500, "Email credentials not configured");
    }
    // Create transporter
    const transporter = nodemailer_1.default.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL,
            pass: process.env.APP_PASS,
        },
    });
    try {
        yield transporter.sendMail({
            from: `"OazPay" <${process.env.EMAIL}>`,
            to: email,
            subject: "Your OTP Code",
            html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>OazPay OTP Verification</h2>
          <p>Your OTP code is:</p>
          <h1 style="letter-spacing: 4px;">${otp}</h1>
          <p>This code will expire in 5 minutes.</p>
        </div>
      `,
        });
        return otp;
    }
    catch (error) {
        console.error(error);
        throw new ApiErrors_1.default(500, "Failed to send OTP email");
    }
});
exports.otpGenerator = otpGenerator;
