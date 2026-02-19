import ApiError from "../errors/ApiErrors";
import prisma from "../shared/prisma";

export const bkashConfig = async () => {
  const result = await prisma.online_pay_configs.findUnique({
    where: {
      bank_name: "BKASH",
    },
  });
  if (!result) throw new ApiError(404, "Bkash payment not found!");
  return {
    baseUrl: result?.base_url,
    username: result?.username,
    password: result?.password,
    appKey: result?.key,
    appSecret: result?.secret,
    callbackURL: result?.call_back_url,
  };
};
