import fs from "fs";
import path from "path";

export const generateFileUrl = (req: any, filePath: string) => {
  // Extract filename relative to "public"
  const relativePath = filePath.replace(/^public[\\/]/, "");
  const protocol = req.protocol;
  const host = req.get("host");

  return `${protocol}://${host}/${relativePath.replace(/\\/g, "/")}`;
};

export const deleteFileByUrl = (fileUrl: string) => {
  try {
    if (!fileUrl) return;

    // Extract path after host (e.g. /uploads/file-123.png)
    const urlPath = new URL(fileUrl).pathname;

    // Convert to local path (prepend "public")
    const localPath = path.join("public", urlPath);

    if (fs.existsSync(localPath)) {
      fs.unlinkSync(localPath);
      console.log(`🗑️ File deleted: ${localPath}`);
    } else {
      console.warn(`⚠️ File not found: ${localPath}`);
    }
  } catch (err) {
    console.error("❌ Error deleting file:", err);
  }
};
