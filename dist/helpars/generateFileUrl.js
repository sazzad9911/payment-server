"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFileByUrl = exports.generateFileUrl = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const generateFileUrl = (req, filePath) => {
    // Extract filename relative to "public"
    const relativePath = filePath.replace(/^public[\\/]/, "");
    const protocol = req.protocol;
    const host = req.get("host");
    return `${protocol}://${host}/${relativePath.replace(/\\/g, "/")}`;
};
exports.generateFileUrl = generateFileUrl;
const deleteFileByUrl = (fileUrl) => {
    try {
        if (!fileUrl)
            return;
        // Extract path after host (e.g. /uploads/file-123.png)
        const urlPath = new URL(fileUrl).pathname;
        // Convert to local path (prepend "public")
        const localPath = path_1.default.join("public", urlPath);
        if (fs_1.default.existsSync(localPath)) {
            fs_1.default.unlinkSync(localPath);
            console.log(`🗑️ File deleted: ${localPath}`);
        }
        else {
            console.warn(`⚠️ File not found: ${localPath}`);
        }
    }
    catch (err) {
        console.error("❌ Error deleting file:", err);
    }
};
exports.deleteFileByUrl = deleteFileByUrl;
