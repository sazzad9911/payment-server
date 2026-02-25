import { Server, Socket } from "socket.io";
import prisma from "../../shared/prisma";
import { z } from "zod";

const registerDeviceZodSchema = z.array(
  z.object({
    number: z
      .string()
      .regex(/^01\d{9}$/, "Number must be 11 digits and start with 01"),
    sim: z.number().int(),
    type: z.enum(["SEND_MONEY", "CASH_OUT", "PAYMENT"]),
    bank: z.enum(["BKASH", "NAGAD", "ROCKET", "UPAY"]),
  }),
);

const idSchema = z.string().min(1);

export const userEvents = (socket: Socket, io: Server) => {
  socket.on("register_device", async (payload) => {
    try {
      // Accept either JSON string or object/array
      const raw = typeof payload === "string" ? JSON.parse(payload) : payload;

      const parsed = registerDeviceZodSchema.safeParse(raw);
      if (!parsed.success) {
        return io.to(socket.id).emit("register_failed", {
          message: "Validation failed",
          issues: parsed.error.issues,
        });
      }

      const results = await Promise.all(
        parsed.data.map((d) =>
          prisma.mobile_banks.upsert({
            where: {
              number_bank_type: {
                number: d.number,
                type: d.type,
                bank: d.bank,
              },
            },
            create: {
              number: d.number,
              sim: d.sim,
              type: d.type,
              bank: d.bank,
              socketId: socket.id,
              isActive: true,
              // only keep this if you DON'T have @updatedAt
              updatedAt: new Date(),
            },
            update: {
              socketId: socket.id,
              isActive: true,
              sim: d.sim,
              type: d.type,
              bank: d.bank,
              updatedAt: new Date(), // only if no @updatedAt
            },
          }),
        ),
      );

      io.to(socket.id).emit("register_success", results);
    } catch (err: any) {
      // JSON.parse error or prisma error
      console.error("register_device error:", err);

      io.to(socket.id).emit("register_failed", {
        message: "Registration failed",
        error: err?.message ?? "Unknown error",
      });
    }
  });

  socket.on("payment_success", async (id: unknown) => {
    try {
      const parsed = idSchema.safeParse(id);
      if (!parsed.success) return;

      await prisma.payment_list.update({
        where: { id: parsed.data },
        data: { status: "SUCCESS" },
      });

      // optional ack
      // socket.emit("payment_status_updated", { id: parsed.data, status: "SUCCESS" });
    } catch (error: any) {
      console.error("payment_success error:", error?.message ?? error);
    }
  });

  socket.on("payment_failed", async (id: unknown) => {
    try {
      const parsed = idSchema.safeParse(id);
      if (!parsed.success) return;

      await prisma.payment_list.update({
        where: { id: parsed.data },
        data: { status: "FAILED" },
      });
    } catch (error: any) {
      console.error("payment_failed error:", error?.message ?? error);
    }
  });

  // ✅ recommended: mark inactive when socket disconnects
  socket.on("disconnect", async () => {
    try {
      await prisma.mobile_banks.updateMany({
        where: { socketId: socket.id },
        data: { isActive: false },
      });
    } catch (e) {
      console.error("disconnect updateMany error:", e);
    }
  });
};
