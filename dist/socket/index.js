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
exports.io = exports.setupSocket = void 0;
const socket_io_1 = require("socket.io");
const user_1 = require("./events/user");
const jwtHelpers_1 = require("../helpars/jwtHelpers");
const config_1 = __importDefault(require("../config"));
let io;
const setupSocket = (server) => {
    exports.io = io = new socket_io_1.Server(server, {
        cors: {
            origin: "*", // Replace with your frontend URL in production
            methods: ["GET", "POST"],
        },
    });
    io.use((socket, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c;
        try {
            let token = ((_a = socket.handshake.auth) === null || _a === void 0 ? void 0 : _a.token) ||
                ((_b = socket.handshake.headers) === null || _b === void 0 ? void 0 : _b.authorization) ||
                ((_c = socket.handshake.query) === null || _c === void 0 ? void 0 : _c.token);
            if (!token) {
                return next(new Error("Unauthorized"));
            }
            if (typeof token === "string" && token.startsWith("Bearer ")) {
                token = token.split(" ")[1];
            }
            const verifiedUser = jwtHelpers_1.jwtHelpers.verifyToken(token, config_1.default.jwt.jwt_secret);
            if (!verifiedUser) {
                return next(new Error("User not found"));
            }
            socket.data.user = verifiedUser;
            next();
        }
        catch (error) {
            console.error("Socket Auth Error:", error);
            next(new Error("Authentication failed"));
        }
    }));
    io.on("connection", (socket) => {
        console.log("New client connected:", socket.id);
        // Attach individual event modules
        (0, user_1.userEvents)(socket, io);
        //otpEvents(socket, io);
    });
};
exports.setupSocket = setupSocket;
