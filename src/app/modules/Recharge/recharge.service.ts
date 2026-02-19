import ApiError from "../../../errors/ApiErrors";
import { rechargeRequestWhereInput } from "../../../generated/prisma/models";
import { sendPush, sendPushMultiple } from "../../../helpars/sendPush";
import prisma from "../../../shared/prisma";
import { io } from "../../../socket";
import { rechargeOfferType, rechargeType } from "./recharge.validation";

const createRecharge = async (payload: rechargeType, userId: string) => {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { id: true, balance: true },
    });

    if (!user) {
      throw new ApiError(404, "Invalid user");
    }

    let baseAmount: number;
    let cashBack: number = 0;
    let auto: boolean = true;
    let offerData = null;

    // 🔹 Direct amount recharge
    if (payload.amount && !payload.offerId) {
      if (payload.amount <= 0) {
        throw new ApiError(400, "Invalid recharge amount");
      }
      baseAmount = payload.amount;
    }

    // 🔹 Offer-based recharge
    else if (payload.offerId) {
      const offer = await tx.rechargeOffers.findUnique({
        where: { id: payload.offerId },
        include: { offer: true },
      });

      if (!offer) {
        throw new ApiError(404, "Invalid offer");
      }
      auto = offer.auto;
      offerData = offer;
      cashBack = offer.cash_back;
      baseAmount = offer.price; // ✔ amount to deduct
    } else {
      throw new ApiError(400, "Amount or offerId required");
    }

    // 🔐 Balance check
    if (user.balance < baseAmount) {
      throw new ApiError(402, "Insufficient Balance");
    }
    //check last recahrge
    const lastRecharge = await tx.rechargeRequest.findFirst({
      where: {
        phone: payload.phone,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        createdAt: true,
      },
    });

    if (lastRecharge) {
      const now = new Date();
      const diffMs = now.getTime() - lastRecharge.createdAt.getTime();
      const diffMinutes = diffMs / (1000 * 60);

      if (diffMinutes < 2) {
        throw new ApiError(429, "Please try again after 2 minutes");
      }
    }

    // 🔹 Get current package
    const currentPackage = await tx.package_buyers.findFirst({
      where: { userId },
      include: { package: true },
      orderBy: { createdAt: "desc" },
    });

    // 🔹 Commission %
    let commissionPercent = 0;

    if (!currentPackage) {
      const settings = await tx.settings.findFirst();
      if (!settings) {
        throw new ApiError(404, "Default settings not found");
      }
      commissionPercent = offerData?.offer ? 0 : settings.recharge_commission;
    } else {
      //check package limit
      if (currentPackage.package.isYearly) {
        const createdAt = new Date(currentPackage.createdAt);
        const expiryDate = new Date(createdAt);
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);

        if (new Date() > expiryDate) {
          throw new ApiError(400, "Your Package has expired!");
        }
      }
      commissionPercent = offerData?.offer
        ? 0
        : currentPackage.package.recharge_commission;
    }

    const bonus = (baseAmount * commissionPercent) / 100;

    // 🔹 Create recharge record
    const recharge = await tx.rechargeRequest.create({
      data: {
        network_type: payload.network_type,
        phone: payload.phone,
        sim_type: payload.sim_type,
        userId,
        amount: baseAmount,
        offerId: payload.offerId ?? null,
        bonus: bonus,
      },
    });

    // 🔹 Single atomic balance update
    const newBalance = user.balance - baseAmount + bonus + cashBack;

    await tx.user.update({
      where: { id: userId },
      data: {
        balance: newBalance,
      },
    });
    const sim = await tx.sim_client.findUnique({
      where: {
        type:
          payload.network_type === "SKITTO"
            ? "GRAMEENPHONE"
            : payload.network_type,
        isActive: true,
      },
    });
    if (!sim) throw new ApiError(404, "Server sim not found!");

    const admins = await tx.user.findMany({
      where: {
        role: "ADMIN",
        fcmToken: {
          not: null,
        },
      },
      select: { fcmToken: true },
    });

    const code = offerData
      ? offerData.ussd?.split("phone").join(payload.phone)
      : sim.recharge_ussd
          .split("phone")
          .join(payload.phone)
          .split("type")
          .join(payload.network_type === "SKITTO" ? "2" : "0")
          .split("amount")
          .join(baseAmount.toString());

    if (auto && code) {
      io.to(sim.socketId).emit("ussd", {
        code: code,
        sim: sim.slot,
        id: recharge.id,
      });
    }

    const tokens = admins
      .map((d) => d.fcmToken)
      .filter((t): t is string => Boolean(t));

    if (tokens.length > 0) {
      await sendPushMultiple(
        tokens,
        "New Recharge",
        `Recharge request created for ${payload.phone} — ৳${baseAmount}`,
      );
    }

    return {
      rechargeId: recharge.id,
      deducted: baseAmount,
      bonus,
      netChange: bonus - baseAmount,
    };
  });
};

const retryRecharge = async (id: string) => {
  const request = await prisma.rechargeRequest.findUnique({
    where: { id: id, status: "FAILED" },
    include: { offer: true },
  });
  if (!request) throw new ApiError(404, "Invalid request!");
  const sim = await prisma.sim_client.findUnique({
    where: { type: request.network_type, isActive: true },
  });
  if (!sim) throw new ApiError(404, "Server sim not found!");

  const code = request.offer
    ? request.offer.ussd?.split("phone").join(request.phone)
    : sim.recharge_ussd
        .split("phone")
        .join(request.phone)
        .split("type")
        .join(request.network_type === "SKITTO" ? "2" : "0")
        .split("amount")
        .join(request.toString());

  if (request.offer) {
    if (!request.offer.auto) {
      return request;
    }
    if (!code) {
      return request;
    }
  }
  io.to(sim.socketId).emit("ussd", {
    code: code,
    sim: sim.slot,
    id: request.id,
  });
  return request;
};
const cancelRecharge = async (id: string) => {
  return await prisma.$transaction(async (tx) => {
    const request = await tx.rechargeRequest.findFirst({
      where: {
        id,
        status: {
          in: ["FAILED", "PENDING"],
        }, // only FAILED PENDING can be cancelled
      },
      include: { offer: true },
    });

    if (!request) {
      throw new ApiError(404, "Invalid or already processed request!");
    }

    // Determine refund amount (bonus already given earlier)
    const refundAmount = request.offer
      ? request.offer.price
      : (request.amount ?? 0);

    if (refundAmount <= 0) {
      throw new ApiError(400, "Invalid refund amount");
    }

    // Update status first to prevent double refund
    const updated = await tx.rechargeRequest.update({
      where: { id },
      data: { status: "CANCELLED", bonus: 0 },
    });

    // Refund ONLY deducted balance
    await tx.user.update({
      where: { id: request.userId },
      data: {
        balance: {
          increment: refundAmount - request.bonus,
        },
      },
    });

    return {
      ...updated,
      refundedAmount: refundAmount - request.bonus,
    };
  });
};
const manualRechargeSuccess = async (id: string) => {
  const request = await prisma.rechargeRequest.findUnique({
    where: {
      id: id,
      status: {
        in: ["FAILED", "PENDING"],
      },
    },
  });
  if (!request) throw new ApiError(404, "Invalid request!");

  const updated = await prisma.rechargeRequest.update({
    where: { id: id },
    data: { status: "SUCCESS" },
  });
  return updated;
};

const getRecharge = async (query: {
  page?: number;
  limit?: number;
  search?: string;
  userId?: string;
}) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;
  const search = query.search?.trim();

  const where: rechargeRequestWhereInput = {
    ...(query.userId && {
      userId: query.userId,
    }),
    ...(search && {
      OR: [
        {
          phone: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          offerId: {
            contains: search,
            mode: "insensitive",
          },
        },
      ],
    }),
  };

  const [data, total] = await Promise.all([
    prisma.rechargeRequest.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        offer: true,
        user: {
          select: {
            name: true,
            phone: true,
            email: true,
          },
        },
      },
    }),
    prisma.rechargeRequest.count({ where }),
  ]);

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const createOffer = async (name: string) => {
  if (name?.length > 60) throw new ApiError(400, "Offer name too long");
  const result = await prisma.offers.create({
    data: {
      title: name,
    },
  });
  return result;
};
const deleteOffer = async (offerId: string) => {
  const result = await prisma.offers.delete({
    where: {
      id: offerId,
    },
  });
  return result;
};
const updateOffer = async (offerId: string, name: string) => {
  if (name?.length > 60) throw new ApiError(400, "Offer name too long");
  const result = await prisma.offers.update({
    where: { id: offerId },
    data: {
      title: name,
    },
  });
  return result;
};
const getAllOffers = async () => {
  const result = await prisma.offers.findMany();
  return result;
};
const createRechargeOffer = async (payload: rechargeOfferType) => {
  const result = await prisma.rechargeOffers.create({
    data: { ...payload },
  });
  return result;
};
const updateRechargeOffer = async (
  id: string,
  payload: Partial<rechargeOfferType>,
) => {
  const result = await prisma.rechargeOffers.update({
    where: { id: id },
    data: { ...payload },
  });
  return result;
};
const deleteRechargeOffer = async (id: string) => {
  const result = await prisma.rechargeOffers.delete({
    where: { id: id },
  });
  return result;
};
const getRechargeOffers = async (query: any) => {
  const result = await prisma.rechargeOffers.findMany({
    where: {
      sim_type: query.sim_type,
      network_type: query.network_type,
      price: query.amount ? parseFloat(query.amount) : undefined,
    },
    include: {
      offer: true,
    },
  });
  return result;
};
const getRechargeOfferByAmount = async (query: any) => {
  const result = await prisma.rechargeOffers.findFirst({
    where: {
      sim_type: query.sim_type,
      network_type: query.network_type,
      price: parseFloat(query.amount),
    },
    include: {
      offer: true,
    },
  });
  return result;
};
export const RechargeServices = {
  getAllOffers,
  createOffer,
  deleteOffer,
  updateOffer,
  createRecharge,
  createRechargeOffer,
  updateRechargeOffer,
  deleteRechargeOffer,
  getRechargeOffers,
  getRecharge,
  retryRecharge,
  cancelRecharge,
  manualRechargeSuccess,
  getRechargeOfferByAmount,
};
