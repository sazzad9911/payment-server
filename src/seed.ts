import config from "./config";
import prisma from "./shared/prisma";
import * as bcrypt from "bcrypt";

export const seed = async () => {
  const admin = await prisma.user.findFirst({
    where: { role: "ADMIN" },
  });
  if (!admin) {
    const hashedPassword = await bcrypt.hash(
      "12345678",
      Number(config.bcrypt_salt_rounds) || 12,
    );
    await prisma.user.create({
      data: {
        name: "Admin",
        email: "admin@example.com",
        password: hashedPassword,
        role: "ADMIN",
        status: "ACTIVE",
        passwordChangedAt: new Date(Date.now() - 30 * 1000),
      },
    });
  }
  return { message: "Seeding completed successfully." };
};
