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
    otpEvents(socket, io);

    socket.on("disconnect", async () => {
      console.log("Client disconnected:", socket.id);

      try {
        await prisma.sim_client.updateMany({
          where: {
            socketId: socket.id,
            isActive: true,
          },
          data: {
            isActive: false,
            updatedAt: new Date(),
          },
        });
      } catch (err) {
        console.error("Disconnect cleanup failed:", err);
      }
    });
  });
};

export { io };
