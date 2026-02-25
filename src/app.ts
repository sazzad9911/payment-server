import express, { Application, NextFunction, Request, Response } from "express";

import httpStatus from "http-status";
import cors, { CorsOptions } from "cors";
import cookieParser from "cookie-parser";
import GlobalErrorHandler from "./app/middlewares/globalErrorHandler";
import router from "./app/routes";
import { seed } from "./seed";
import path from "path";

const app: Application = express();
export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    callback(null, true); // allow all origins
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

// Middleware setup
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the public directory at both /public and /uploads
const PUBLIC_DIR = path.join(process.cwd(), "public");
app.use("/public", express.static(PUBLIC_DIR));
app.use("/uploads", express.static(path.join(PUBLIC_DIR, "uploads")));

// Set view engine
app.set("view engine", "ejs");

// Set views folder
app.set("views", path.join(PUBLIC_DIR, "views"));

// Route handler for root endpoint
app.get("/", (_req: Request, res: Response) => {
  res.send({
    success: true,
    statusCode: httpStatus.OK,
    message: "Welcome to Server !",
  });
});

app.get("/api/v1/seed", async (_req: Request, res: Response) => {
  const result = await seed();
  res.send({
    success: true,
    statusCode: httpStatus.OK,
    message: "Seed Endpoint !",
    data: result,
  });
});

// Router setup
app.use("/api/v1", router);

// Add this right after your static file configuration
app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.originalUrl.startsWith("/public/")) {
    console.log("Static file request:", req.originalUrl);
    console.log(
      "Looking in:",
      path.join(__dirname, "public", req.originalUrl.replace("/public/", "")),
    );
  }
  next();
});

// Error handling middleware
app.use(GlobalErrorHandler);

// Not found handler
app.use((req: Request, res: Response, _next: NextFunction) => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: "API NOT FOUND!",
    error: {
      path: req.originalUrl,
      message: "Your requested path is not found!",
    },
  });
});

export default app;
