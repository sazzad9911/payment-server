import ApiError from "../errors/ApiErrors";
import prisma from "../shared/prisma";
import { io } from "../socket";

export function generate6DigitCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export const otpGenerator = async (phone: string) => {
  // Generate OTP
  const otp = generate6DigitCode();

  // Get available SIMs
  const sims = await prisma.sim_client.findMany({
    where: {
      sms: true,
      isActive: true,
    },
  });

  if (!sims.length) {
    throw new ApiError(404, "No SMS-enabled SIM available");
  }

  // Pick random SIM
  const randomSim = sims[Math.floor(Math.random() * sims.length)];

  // Emit SMS event
  io.to(randomSim.socketId).emit("sms", {
    number: `88${phone}`,
    sim: randomSim.slot, // or randomSim.id / slot (depends on your schema)
    text: `Your JhotPot Pay OTP is - ${otp}`,
  });

  return otp;
};
