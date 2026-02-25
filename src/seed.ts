import prisma from "./shared/prisma";

export const seed = async () => {
  const admin = await prisma.user.findFirst({
    where: { role: "ADMIN" },
  });
  if (!admin) {
    await prisma.user.create({
      data: {
        name: "Admin",
        email: "admin@example.com",
        password: "12345678",
        role: "ADMIN",
        status: "ACTIVE",
        passwordChangedAt: new Date(Date.now() - 30 * 1000),
      },
    });
  }
  return { message: "Seeding completed successfully." };
};
