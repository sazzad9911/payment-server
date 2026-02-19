import ApiError from "../../../errors/ApiErrors";
import prisma from "../../../shared/prisma";
import {
  PackageType,
  SettingType,
  UpdatePackageType,
} from "./Package.Validation";

const createPackage = async (payload: PackageType) => {
  const result = await prisma.packages.create({
    data: {
      ...payload,
    },
  });
  return result;
};
const getAllPackages = async () => {
  return prisma.packages.findMany({
    orderBy: { name: "asc" },
  });
};
const getPackageById = async (id: string) => {
  const result = await prisma.packages.findUnique({ where: { id } });
  if (!result) throw new ApiError(404, "Package not found");
  return result;
};
const updatePackage = async (id: string, payload: UpdatePackageType) => {
  await getPackageById(id);

  return prisma.packages.update({
    where: { id },
    data: payload,
  });
};

/**
 * Delete Package
 */
const deletePackage = async (id: string) => {
  await getPackageById(id);

  return prisma.packages.delete({
    where: { id },
  });
};
const buyPackage = async (userId: string, packageId: string) => {
  return prisma.$transaction(async (tx) => {
    // 1️⃣ User
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { id: true, balance: true },
    });

    if (!user) throw new ApiError(404, "User not found");

    // 2️⃣ Package
    const thePackage = await tx.packages.findUnique({
      where: { id: packageId },
    });

    if (!thePackage) throw new ApiError(404, "Package not found");

    // 3️⃣ Already bought check
    const alreadyBought = await tx.package_buyers.findFirst({
      where: {
        userId,
        packageId,
      },
    });

    if (alreadyBought) {
      throw new ApiError(409, "Package already purchased");
    }

    // 4️⃣ Balance check
    if (user.balance < thePackage.price) {
      throw new ApiError(400, "Low balance, please add balance");
    }

    // 5️⃣ Create buyer record
    await tx.package_buyers.create({
      data: {
        userId,
        packageId,
      },
    });

    // 6️⃣ Deduct balance (atomic)
    await tx.user.update({
      where: { id: userId },
      data: {
        balance: {
          decrement: thePackage.price,
        },
      },
    });

    return {
      success: true,
      message: "Package purchased successfully",
    };
  });
};
const updateSettings = async (payload: SettingType) => {
  const settings = await prisma.settings.findFirst();
  let result;
  if (!settings) {
    result = await prisma.settings.create({
      data: {
        ...payload,
      },
    });
  } else {
    result = await prisma.settings.update({
      where: { id: settings.id },
      data: {
        ...payload,
      },
    });
  }
  return result;
};
const getSettings = async () => {
  const result = await prisma.settings.findFirst();
  return result;
};
export const PackageService = {
  createPackage,
  getAllPackages,
  getPackageById,
  updatePackage,
  deletePackage,
  buyPackage,
  updateSettings,
  getSettings,
};
