import { Server, Socket } from "socket.io";
import prisma from "../../shared/prisma";

export const otpEvents = (socket: Socket, io: Server) => {
  socket.on("otp:success", async (id: string) => {
    try {
      console.log(id, "OTP success");
      await prisma.otpCodes.update({
        where: { id },
        data: { isSuccess: true },
      });
      io.emit("otp:success", { id: id });
    } catch (err) {
      console.error("Failed to update OTP:", err);
      socket.emit("otp:error", { message: "Failed to update OTP", id: id });
    }
  });

  socket.on("otp:failed", (id: string) => {
    console.log(id, "OTP failed");
    io.emit("otp:failed", { id: id });
  });
};
