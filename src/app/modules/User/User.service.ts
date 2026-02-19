import ApiError from "../../../errors/ApiErrors";
import { UserWhereInput } from "../../../generated/prisma/models";
import prisma from "../../../shared/prisma";
import { UpdateUserType } from "./User.validation";

const toggleBlockUser = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new ApiError(404, "User not found!");
  if (user.role === "ADMIN") {
    throw new ApiError(404, "Admin account can't block!");
  }
  const result = await prisma.user.update({
    where: { id: user.id },
    data: {
      status: user.status === "ACTIVE" ? "BLOCKED" : "ACTIVE",
    },
  });
  return result;
};
const updateUser = async (userId: string, payload: UpdateUserType) => {
  const result = await prisma.user.update({
    where: { id: userId },
    data: { ...payload },
  });
  return result;
};
interface IUserListParams {
  page?: number;
  limit?: number;
  search?: string;
}
const getUserList = async (params: IUserListParams) => {
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 10;
  const skip = (page - 1) * limit;
  const search = params.search?.trim();

  const where: UserWhereInput = {};
  // where.role = {
  //   not: {
  //     equals: "ADMIN",
  //   },
  // };
  // 🔍 Search by name or phone
  if (search) {
    where.OR = [
      {
        name: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        phone: {
          contains: search,
        },
      },
    ];
  }

  const [data, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        role: true,
        status: true,
        balance: true,
        createdAt: true,
        address: true,
        _count: {
          select: {
            products: true,
          },
        },
        packageBuyers: {
          take: 1,
          orderBy: {
            createdAt: "desc",
          },
          select: {
            package: true,
          },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data,
  };
};
const addBalance = async (userId: string, amount: number) => {
  if (amount <= 0) {
    throw new ApiError(400, "Amount must be greater than 0");
  }

  return await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) throw new ApiError(404, "User not found!");

    await tx.credit_list.create({
      data: {
        userId,
        amount: amount.toString(), // should be Decimal/number in schema
        account_number: "N/A",
        bank_name: "NA",
        online_pay: false,
        status: "APPROVED",
      },
    });

    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: {
        balance: {
          increment: amount, // 🔥 atomic update
        },
      },
    });

    return updatedUser;
  });
};
const cutBalance = async (userId: string, amount: number) => {
  if (amount <= 0) {
    throw new ApiError(400, "Amount must be greater than 0");
  }

  return await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { id: true, balance: true },
    });

    if (!user) throw new ApiError(404, "User not found!");

    if (user.balance < amount) throw new ApiError(400, "Insufficient balance");

    await tx.debit_list.create({
      data: {
        userId,
        amount: amount.toString(), // should be Decimal/number in schema
        account_number: "N/A",
        bank_name: "NA",
        status: "APPROVED",
      },
    });

    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: {
        balance: {
          decrement: amount, // 🔥 atomic update
        },
      },
    });

    return updatedUser;
  });
};
export const UserService = {
  getUserList,
  updateUser,
  toggleBlockUser,
  addBalance,
  cutBalance,
};
