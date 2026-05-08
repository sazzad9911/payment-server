import { Server, Socket } from "socket.io";
import prisma from "../../shared/prisma";
import { z } from "zod";
import {
  validateBkashPayment,
  validateNagadPayment,
} from "../../helpars/parseSMS";

const registerDeviceZodSchema = z.array(
  z.object({
    number: z
      .string()
      .regex(/^01\d{9}$/, "Number must be 11 digits and start with 01"),
    sim: z.coerce.number().int(),
    type: z.enum(["SEND_MONEY", "CASH_OUT", "PAYMENT"]),
    bank: z.enum(["BKASH", "NAGAD", "ROCKET", "UPAY"]),
  }),
);

const idSchema = z.string().min(1);

const call_schema = z.array(
  z.object({
    MSISDN: z.string(),
    text: z.string(),
    paymentId: z.string().uuid(),
  }),
);

export const userEvents = (socket: Socket, io: Server) => {
  socket.on("register_device", async (payload) => {
    console.error(payload);
    try {
      // Accept either JSON string or object/array
      const raw = typeof payload === "string" ? JSON.parse(payload) : payload;

      const parsed = await registerDeviceZodSchema.parseAsync(raw);
      // if (!parsed.success) {
      //   return io.to(socket.id).emit("register_failed", {
      //     message: "Validation failed",
      //     issues: parsed.error.issues,
      //   });
      // }

      const results = [];

      for (const d of parsed) {
        const result = await prisma.mobile_banks.upsert({
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
          },
          update: {
            socketId: socket.id,
            isActive: true,
            sim: d.sim,
          },
        });

        results.push(result);
      }

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

  socket.on("call_device", async (paymentId: string) => {
    try {
      const payment = await prisma.payment_list.findUnique({
        where: { id: paymentId },
        include: { bank: true },
      });

      io.emit("payment", payment);
    } catch (e: any) {
      console.error("call_device error:", e);
      return io.to(socket.id).emit("call_failed", {
        message: "Failed to call device",
        error: e?.message ?? "Unknown error",
      });
    }
  });
  socket.on("message_list", async (payload) => {
    try {
      const raw = typeof payload === "string" ? JSON.parse(payload) : payload;
      const parsed = await call_schema.parseAsync(raw);

      //console.log(parsed)

      const payment = await prisma.payment_list.findUnique({
        where: { id: parsed[0].paymentId },
        include: { bank: true },
      });
      if (!payment) {
        return io.to(socket.id).emit("message_list_failed", {
          message: "Payment not found",
        });
      }
      if (payment.bank.bank === "BKASH") {
        const isValid = parsed.some((sms) =>
          validateBkashPayment(
            sms.text,
            payment.amount,
            payment.tnx_id,
            sms.MSISDN,
          ),
        );

        if (!isValid) {
          await prisma.payment_list.update({
            where: { id: payment.id },
            data: { status: "FAILED" },
          });
          return io.to(socket.id).emit("message_list_failed", {
            message: "Payment validation failed",
          });
        }
      }
      if (payment.bank.bank === "NAGAD") {
        const isValid = parsed.some((sms) =>
          validateNagadPayment(
            sms.text,
            payment.amount,
            payment.tnx_id,
            sms.MSISDN,
          ),
        );

        if (!isValid) {
          await prisma.payment_list.update({
            where: { id: payment.id },
            data: { status: "FAILED" },
          });
          return io.to(socket.id).emit("message_list_failed", {
            message: "Payment validation failed",
          });
        }
      }
      await prisma.payment_list.update({
        where: { id: payment.id },
        data: { status: "SUCCESS" },
      });
      await prisma.sites.update({
        where: { id: payment.site_id },
        data: {
          balance: {
            increment: payment.amount,
          },
        },
      });
      io.to(socket.id).emit("message_list_success", parsed);
    } catch (error: any) {
      console.error("message_list error:", error);
      io.to(socket.id).emit("message_list_failed", {
        message: "Failed to process message list",
        error: error?.message ?? "Unknown error",
      });
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
