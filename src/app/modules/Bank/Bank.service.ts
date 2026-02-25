import ApiError from "../../../errors/ApiErrors";
import prisma from "../../../shared/prisma";

const getAllBanks = async () => {
  const result = await prisma.mobile_banks.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          paymentLists: true,
        },
      },
    },
  });
  return result;
};
const toggleBankStatus = async (id: string) => {
  const bank = await prisma.mobile_banks.findUnique({
    where: { id },
  });
  if (!bank) {
    throw new ApiError(404, "Bank not found");
  }
  const updatedBank = await prisma.mobile_banks.update({
    where: { id },
    data: { status: bank.status == "ACTIVE" ? "BLOCKED" : "ACTIVE" },
  });
  return updatedBank;
};
const deleteBank = async (id: string) => {
  const bank = await prisma.mobile_banks.findUnique({
    where: { id },
  });
  if (!bank) {
    throw new ApiError(404, "Bank not found");
  }
  await prisma.mobile_banks.delete({
    where: { id },
  });
  return { message: "Bank deleted successfully" };
};
export const BankServices = {
  getAllBanks,
  toggleBankStatus,
  deleteBank,
};
