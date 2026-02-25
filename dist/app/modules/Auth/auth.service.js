"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthServices = void 0;
const config_1 = __importDefault(require("../../../config"));
const jwtHelpers_1 = require("../../../helpars/jwtHelpers");
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const bcrypt = __importStar(require("bcrypt"));
const ApiErrors_1 = __importDefault(require("../../../errors/ApiErrors"));
const http_status_1 = __importDefault(require("http-status"));
const otpGenerator_1 = require("../../../helpars/otpGenerator");
// user registration
const registerUser = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    // 2. Check if user already exists with this email
    const { otpId } = payload, rest = __rest(payload, ["otpId"]);
    const existingUser = yield prisma_1.default.otpCodes.findFirst({
        where: {
            id: otpId,
        },
    });
    if (!existingUser) {
        throw new ApiErrors_1.default(http_status_1.default.CONFLICT, `Please verify email first!`);
    }
    // 3. Hash the password
    const hashedPassword = yield bcrypt.hash(payload.password, Number(config_1.default.bcrypt_salt_rounds) || 12);
    const uid = (0, jwtHelpers_1.generateUUID)();
    // 4. Create the new user
    const newUser = yield prisma_1.default.user.create({
        data: {
            password: hashedPassword,
            passwordChangedAt: new Date(Date.now() - 30 * 1000),
            email: existingUser.email,
            activeTokenId: uid,
            name: rest.name,
        },
    });
    // 5. Generate access token
    const accessToken = jwtHelpers_1.jwtHelpers.generateToken({
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        uid: uid,
    }, config_1.default.jwt.jwt_secret, config_1.default.jwt.expires_in);
    return {
        token: accessToken,
        user: newUser,
    };
});
//send otp
const sendOTP = (payload, reset) => __awaiter(void 0, void 0, void 0, function* () {
    const isUser = yield prisma_1.default.user.findUnique({
        where: { email: payload.email },
    });
    if (isUser && !reset)
        throw new ApiErrors_1.default(http_status_1.default.EXPECTATION_FAILED, "User already registered!");
    const otp = yield (0, otpGenerator_1.otpGenerator)(payload.email);
    const result = yield prisma_1.default.otpCodes.upsert({
        where: { email: payload.email },
        create: {
            code: otp,
            email: payload.email,
            updatedAt: new Date(),
        },
        update: {
            code: otp,
            updatedAt: new Date(),
        },
        select: {
            email: true,
        },
    });
    return result;
});
const validateOtp = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.otpCodes.findUnique({
        where: { email: payload.email },
    });
    if (!result) {
        throw new ApiErrors_1.default(http_status_1.default.NOT_FOUND, "OTP not found!");
    }
    const otpAgeMs = new Date().getTime() - result.updatedAt.getTime(); // difference in milliseconds
    const maxAgeMs = 5 * 60 * 1000; // 5 minutes in milliseconds
    if (otpAgeMs > maxAgeMs) {
        throw new ApiErrors_1.default(http_status_1.default.GATEWAY_TIMEOUT, "OTP is expired!");
    }
    // Optionally, verify OTP code too
    if (result.code !== payload.otp) {
        throw new ApiErrors_1.default(http_status_1.default.BAD_REQUEST, "Invalid OTP code!");
    }
    return result;
});
// user login
const loginUser = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const userData = yield prisma_1.default.user.findUnique({
        where: {
            email: payload.email,
        },
    });
    if (!(userData === null || userData === void 0 ? void 0 : userData.email)) {
        throw new ApiErrors_1.default(http_status_1.default.NOT_FOUND, "User not found! with this email " + payload.email);
    }
    const isCorrectPassword = yield bcrypt.compare(payload.password, userData.password);
    if (!isCorrectPassword) {
        throw new ApiErrors_1.default(http_status_1.default.BAD_REQUEST, "Password incorrect!");
    }
    const uid = (0, jwtHelpers_1.generateUUID)();
    yield prisma_1.default.user.update({
        where: { id: userData.id },
        data: { activeTokenId: uid },
    });
    const accessToken = jwtHelpers_1.jwtHelpers.generateToken({
        id: userData.id,
        email: userData.email,
        role: userData.role,
        uid: uid,
    }, config_1.default.jwt.jwt_secret, config_1.default.jwt.expires_in);
    return { token: accessToken, user: userData };
});
// change password
const changePassword = (userToken, newPassword, oldPassword) => __awaiter(void 0, void 0, void 0, function* () {
    const decodedToken = jwtHelpers_1.jwtHelpers.verifyToken(userToken, config_1.default.jwt.jwt_secret);
    const user = yield prisma_1.default.user.findUnique({
        where: { id: decodedToken === null || decodedToken === void 0 ? void 0 : decodedToken.id },
    });
    if (!user) {
        throw new ApiErrors_1.default(404, "User not found");
    }
    const isPasswordValid = yield bcrypt.compare(oldPassword, user === null || user === void 0 ? void 0 : user.password);
    if (!isPasswordValid) {
        throw new ApiErrors_1.default(401, "Incorrect old password");
    }
    const hashedPassword = yield bcrypt.hash(newPassword, 12);
    const _result = yield prisma_1.default.user.update({
        where: {
            id: decodedToken.id,
        },
        data: {
            password: hashedPassword,
            passwordChangedAt: new Date(),
        },
    });
    const newToken = jwtHelpers_1.jwtHelpers.generateToken({ id: user.id, email: user.email, role: user.role }, config_1.default.jwt.jwt_secret, config_1.default.jwt.expires_in);
    return {
        message: "Password changed successfully",
        token: { token: newToken, user }, // send new token to frontend
    };
});
const forgotPassword = (otpId, password) => __awaiter(void 0, void 0, void 0, function* () {
    const otp = yield prisma_1.default.otpCodes.findUnique({
        where: {
            id: otpId,
        },
    });
    if (!otp)
        throw new ApiErrors_1.default(404, "Please verify otp!");
    // 3. Hash the password
    const hashedPassword = yield bcrypt.hash(password, Number(config_1.default.bcrypt_salt_rounds) || 12);
    // 4. Create the new user
    const newUser = yield prisma_1.default.user.update({
        where: { email: otp.email },
        data: {
            password: hashedPassword,
            passwordChangedAt: new Date(Date.now() - 30 * 1000),
        },
    });
    // 5. Generate access token
    const accessToken = jwtHelpers_1.jwtHelpers.generateToken({
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
    }, config_1.default.jwt.jwt_secret, config_1.default.jwt.expires_in);
    return {
        token: accessToken,
        user: newUser,
    };
});
// reset password
const resetPassword = (token, payload) => __awaiter(void 0, void 0, void 0, function* () {
    if (!token) {
        throw new ApiErrors_1.default(http_status_1.default.FORBIDDEN, "Forbidden!");
    }
    const isValidToken = jwtHelpers_1.jwtHelpers.verifyToken(token, config_1.default.jwt.reset_pass_secret);
    if (!isValidToken) {
        throw new ApiErrors_1.default(http_status_1.default.FORBIDDEN, "Forbidden!");
    }
    const userData = yield prisma_1.default.user.findUniqueOrThrow({
        where: {
            id: isValidToken.id,
        },
    });
    // hash password
    const password = yield bcrypt.hash(payload.password, 12);
    // update into database
    yield prisma_1.default.user.update({
        where: {
            id: userData.id,
        },
        data: {
            password,
        },
    });
    return { message: "Password reset successfully" };
});
const checkAuth = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const userData = yield prisma_1.default.user.findUnique({
        where: { id: userId },
    });
    return userData;
});
const updateToken = (userId, token) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.user.update({
        where: { id: userId },
        data: { fcmToken: token },
    });
    return result;
});
exports.AuthServices = {
    registerUser,
    loginUser,
    changePassword,
    forgotPassword,
    resetPassword,
    checkAuth,
    sendOTP,
    validateOtp,
    updateToken,
};
