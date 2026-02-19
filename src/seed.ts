import prisma from "./shared/prisma";

export const seed = async () => {
  const settings = await prisma.settings.findFirst();
  if (!settings) {
    await prisma.settings.create({
      data: {
        free_product_limit: 50,
        recharge_commission: 0,
      },
    });
  }
  return { message: "Seeding completed successfully." };
};
