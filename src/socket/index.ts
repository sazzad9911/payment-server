import { Server, Socket } from "socket.io";
import { userEvents } from "./events/user";
import { otpEvents } from "./events/otp";
import prisma from "../shared/prisma";
import { jwtHelpers } from "../helpars/jwtHelpers";
import config from "../config";
import { Secret } from "jsonwebtoken";

let io: Server;

export const setupSocket = (server: any) => {
  io = new Server(server, {
    cors: {
      origin: "*", // Replace with your frontend URL in production
      methods: ["GET", "POST"],
    },
  });

  io.use(async (socket, next) => {
    try {
      let token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization ||
        socket.handshake.query?.token;

      if (!token) {
        return next(new Error("Unauthorized"));
      }

      if (typeof token === "string" && token.startsWith("Bearer ")) {
        token = token.split(" ")[1];
      }

      const verifiedUser = jwtHelpers.verifyToken(
        token as string,
        config.jwt.jwt_secret as Secret,
      );

      if (!verifiedUser) {
        return next(new Error("User not found"));
      }

      socket.data.user = verifiedUser;

      next();
    } catch (error) {
      console.error("Socket Auth Error:", error);
      next(new Error("Authentication failed"));
    }
  });

  io.on("connection", (socket: Socket) => {
    console.log("New client connected:", socket.id);
    // Attach individual event modules
    userEvents(socket, io);
    //otpEvents(socket, io);
  });
};

export { io };
