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
exports.sendPushMultiple = exports.sendPush = void 0;
const firebase_1 = __importDefault(require("../config/firebase"));
const sendPush = (token, title, body) => __awaiter(void 0, void 0, void 0, function* () {
    yield firebase_1.default.messaging().send({
        token,
        notification: {
            title,
            body,
        },
        android: {
            priority: "high",
        },
        webpush: {
            notification: {
                icon: "https://i.ibb.co.com/Q3mtZDZK/appstore.jpg",
            },
        },
    });
});
exports.sendPush = sendPush;
const sendPushMultiple = (tokens, title, body) => __awaiter(void 0, void 0, void 0, function* () {
    yield firebase_1.default.messaging().sendEachForMulticast({
        tokens,
        notification: {
            title,
            body,
        },
        webpush: {
            notification: {
                icon: "https://i.ibb.co.com/Q3mtZDZK/appstore.jpg",
            },
        },
    });
});
exports.sendPushMultiple = sendPushMultiple;
