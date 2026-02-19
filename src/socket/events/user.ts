import { Server, Socket } from "socket.io";
import prisma from "../../shared/prisma";

const findType = (carrier: string) => {
  const name = carrier?.trim().toLowerCase();

  switch (name) {
    case "grameenphone":
      return "GRAMEENPHONE";
    case "robi":
      return "ROBI";
    case "airtel":
      return "AIRTEL";
    case "banglalink":
      return "BANGLALINK";
    case "teletalk":
      return "TELETALK";
    case "gramenphone":
      return "GRAMEENPHONE";
    default:
      return "GRAMEENPHONE";
  }
};

export const userEvents = (socket: Socket, io: Server) => {
  socket.on("register_device", async (data) => {
    const obj = JSON.parse(data);
    console.log(obj);
    try {
      if (!Array.isArray(obj)) return;

      await Promise.all(
        obj.map((d) =>
          prisma.sim_client.upsert({
            where: {
              type: findType(d.carrier),
            },
            create: {
              carrier: d.carrier,
              recharge_ussd: "*2#",
              slot: d.slot,
              socketId: socket.id,
              subId: d.subId?.toString(),
              type: findType(d.carrier),
              isActive: true,
              updatedAt: new Date(),
            },
            update: {
              socketId: socket.id,
              subId: d.subId?.toString(),
              isActive: true,
              updatedAt: new Date(),
              slot: d.slot,
            },
          }),
        ),
      );

      socket.emit("register_success");
    } catch (err) {
      console.error("register_device error:", err);
      socket.emit("register_failed", { message: "Registration failed" });
    }
  });

  socket.on("ussd_success", async (id: string) => {
    console.log("ussd_success", id);
    try {
      await prisma.rechargeRequest.update({
        where: { id: id },
        data: {
          status: "SUCCESS",
        },
      });
    } catch (error) {
      console.error(error);
    }
  });
  socket.on("ussd_failed", async (id: string) => {
    console.log("ussd_failed", id);
    try {
      await prisma.rechargeRequest.update({
        where: { id: id },
        data: {
          status: "FAILED",
        },
      });
    } catch (error) {
      console.error(error);
    }
  });
  socket.on("user:sms", (req: any) => {
    console.log(req, "is online");
    io.emit("sms", {
      number: req.number,
      sim: req.sim,
      text: req.text,
    });
  });

  socket.on("sms_success", (res: string) => {
    console.log("sms_success", res);
  });
  socket.on("sms_failed", (res: string) => {
    console.log("sms_failed", res);
  });
};
