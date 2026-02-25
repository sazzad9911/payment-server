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
exports.bkashAuth = void 0;
const httpClient_1 = require("../config/httpClient");
const ApiErrors_1 = __importDefault(require("../errors/ApiErrors"));
const bkashAuth = (config) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const res = yield httpClient_1.httpClient.post(`${config.baseUrl}/tokenized/checkout/token/grant`, {
        app_key: config.appKey,
        app_secret: config.appSecret,
    }, {
        headers: {
            username: config.username,
            password: config.password,
        },
    });
    // bKash returns id_token on success
    if (((_a = res.data) === null || _a === void 0 ? void 0 : _a.statusCode) !== "0000") {
        //console.error("bKash Auth failed:", res.data);
        throw new ApiErrors_1.default(404, (_b = res.data) === null || _b === void 0 ? void 0 : _b.statusMessage);
    }
    return res.data.id_token;
});
exports.bkashAuth = bkashAuth;
