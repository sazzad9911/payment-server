import { Server, Socket } from "socket.io";
import { userEvents } from "./events/user";
import { otpEvents } from "./events/otp";
import prisma from "../shared/prisma";

let io: Server;

export const setupSocket = (server: any) => {
  io = new Server(server, {
    cors: {
      origin: "*", // Replace with your frontend URL in production
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket: Socket) => {
    console.log("New client connected:", socket.id);
    // Attach individual event modules
    userEvents(socket, io);
    //otpEvents(socket, io);
  });
};

export { io };
