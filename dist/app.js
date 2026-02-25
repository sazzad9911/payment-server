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
exports.corsOptions = void 0;
const express_1 = __importDefault(require("express"));
const http_status_1 = __importDefault(require("http-status"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const globalErrorHandler_1 = __importDefault(require("./app/middlewares/globalErrorHandler"));
const routes_1 = __importDefault(require("./app/routes"));
const seed_1 = require("./seed");
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
exports.corsOptions = {
    origin: (origin, callback) => {
        callback(null, true); // allow all origins
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
};
// Middleware setup
app.use((0, cors_1.default)(exports.corsOptions));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Serve static files from the public directory at both /public and /uploads
const PUBLIC_DIR = path_1.default.join(process.cwd(), "public");
app.use("/public", express_1.default.static(PUBLIC_DIR));
app.use("/uploads", express_1.default.static(path_1.default.join(PUBLIC_DIR, "uploads")));
// Set view engine
app.set("view engine", "ejs");
// Set views folder
app.set("views", path_1.default.join(PUBLIC_DIR, "views"));
// Route handler for root endpoint
app.get("/", (_req, res) => {
    res.send({
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Welcome to Server !",
    });
});
app.get("/api/v1/seed", (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield (0, seed_1.seed)();
    res.send({
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Seed Endpoint !",
        data: result,
    });
}));
// Router setup
app.use("/api/v1", routes_1.default);
// Add this right after your static file configuration
app.use((req, res, next) => {
    if (req.originalUrl.startsWith("/public/")) {
        console.log("Static file request:", req.originalUrl);
        console.log("Looking in:", path_1.default.join(__dirname, "public", req.originalUrl.replace("/public/", "")));
    }
    next();
});
// Error handling middleware
app.use(globalErrorHandler_1.default);
// Not found handler
app.use((req, res, _next) => {
    res.status(http_status_1.default.NOT_FOUND).json({
        success: false,
        message: "API NOT FOUND!",
        error: {
            path: req.originalUrl,
            message: "Your requested path is not found!",
        },
    });
});
exports.default = app;
