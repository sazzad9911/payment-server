import { Secret } from "jsonwebtoken";
import config from "../../../config";
import { generateUUID, jwtHelpers } from "../../../helpars/jwtHelpers";
import prisma from "../../../shared/prisma";
import * as bcrypt from "bcrypt";
import ApiError from "../../../errors/ApiErrors";
import httpStatus from "http-status";
import { otpType, RegisterType, verifyOtpType } from "./auth.validation";
import { otpGenerator } from "../../../helpars/otpGenerator";

// user registration
const registerUser = async (payload: RegisterType) => {
  // 2. Check if user already exists with this email
  const { otpId, ...rest } = payload;
  const existingUser = await prisma.otpCodes.findFirst({
    where: {
      id: otpId,
    },
  });

  if (!existingUser) {
    throw new ApiError(
      httpStatus.CONFLICT,
      `Please verify phone number first!`,
    );
  }

  // 3. Hash the password
  const hashedPassword = await bcrypt.hash(
    payload.password,
    Number(config.bcrypt_salt_rounds) || 12,
  );
  const uid = generateUUID();
  // 4. Create the new user
  const newUser = await prisma.user.create({
    data: {
      ...rest,
      password: hashedPassword,
      passwordChangedAt: new Date(Date.now() - 30 * 1000),
      phone: existingUser.phone,
      activeTokenId: uid,
    },
  });

  // 5. Generate access token
  const accessToken = jwtHelpers.generateToken(
    {
      id: newUser.id,
      phone: newUser.phone,
      role: newUser.role,
      uid: uid,
    },
    config.jwt.jwt_secret as Secret,
    config.jwt.expires_in as string,
  );
  return {
    token: accessToken,
    user: newUser,
  };
};
//send otp
const sendOTP = async (payload: otpType, reset: boolean) => {
  const isUser = await prisma.user.findUnique({
    where: { phone: payload.phone },
  });
  if (isUser && !reset)
    throw new ApiError(
      httpStatus.EXPECTATION_FAILED,
      "User already registered!",
    );
  const otp = await otpGenerator(payload.phone);
  const result = await prisma.otpCodes.upsert({
    where: { phone: payload.phone },
    create: {
      code: otp,
      phone: payload.phone,
      updatedAt: new Date(),
    },
    update: {
      code: otp,
      updatedAt: new Date(),
    },
    select: {
      phone: true,
    },
  });
  return result;
};
const validateOtp = async (payload: verifyOtpType) => {
  const result = await prisma.otpCodes.findUnique({
    where: { phone: payload.phone },
  });

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, "OTP not found!");
  }

  const otpAgeMs = new Date().getTime() - result.updatedAt.getTime(); // difference in milliseconds
  const maxAgeMs = 5 * 60 * 1000; // 5 minutes in milliseconds

  if (otpAgeMs > maxAgeMs) {
    throw new ApiError(httpStatus.GATEWAY_TIMEOUT, "OTP is expired!");
  }

  // Optionally, verify OTP code too
  if (result.code !== payload.otp) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid OTP code!");
  }

  return result;
};

// user login
const loginUser = async (payload: { phone: string; password: string }) => {
  const userData = await prisma.user.findUnique({
    where: {
      phone: payload.phone,
    },
  });
  if (!userData?.phone) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "User not found! with this phone " + payload.phone,
    );
  }
  const isCorrectPassword: boolean = await bcrypt.compare(
    payload.password,
    userData.password,
  );

  if (!isCorrectPassword) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Password incorrect!");
  }
  const uid = generateUUID();
  await prisma.user.update({
    where: { id: userData.id },
    data: { activeTokenId: uid },
  });
  const accessToken = jwtHelpers.generateToken(
    {
      id: userData.id,
      email: userData.email,
      role: userData.role,
      uid: uid,
    },
    config.jwt.jwt_secret as Secret,
    config.jwt.expires_in as string,
  );

  return { token: accessToken, user: userData };
};

// change password
const changePassword = async (
  userToken: string,
  newPassword: string,
  oldPassword: string,
) => {
  const decodedToken = jwtHelpers.verifyToken(
    userToken,
    config.jwt.jwt_secret!,
  );

  const user = await prisma.user.findUnique({
    where: { id: decodedToken?.id },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isPasswordValid = await bcrypt.compare(oldPassword, user?.password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Incorrect old password");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  const _result = await prisma.user.update({
    where: {
      id: decodedToken.id,
    },
    data: {
      password: hashedPassword,
      passwordChangedAt: new Date(),
    },
  });

  const newToken = jwtHelpers.generateToken(
    { id: user.id, email: user.email, role: user.role },
    config.jwt.jwt_secret!,
    config.jwt.expires_in!,
  );

  return {
    message: "Password changed successfully",
    token: { token: newToken, user }, // send new token to frontend
  };
};

const forgotPassword = async (otpId: string, password: string) => {
  const otp = await prisma.otpCodes.findUnique({
    where: {
      id: otpId,
    },
  });
  if (!otp) throw new ApiError(404, "Please verify otp!");

  // 3. Hash the password
  const hashedPassword = await bcrypt.hash(
    password,
    Number(config.bcrypt_salt_rounds) || 12,
  );

  // 4. Create the new user
  const newUser = await prisma.user.update({
    where: { phone: otp.phone },
    data: {
      password: hashedPassword,
      passwordChangedAt: new Date(Date.now() - 30 * 1000),
    },
  });

  // 5. Generate access token
  const accessToken = jwtHelpers.generateToken(
    {
      id: newUser.id,
      phone: newUser.phone,
      role: newUser.role,
    },
    config.jwt.jwt_secret as Secret,
    config.jwt.expires_in as string,
  );
  return {
    token: accessToken,
    user: newUser,
  };
};

// reset password
const resetPassword = async (token: string, payload: { password: string }) => {
  if (!token) {
    throw new ApiError(httpStatus.FORBIDDEN, "Forbidden!");
  }

  const isValidToken = jwtHelpers.verifyToken(
    token,
    config.jwt.reset_pass_secret as Secret,
  );

  if (!isValidToken) {
    throw new ApiError(httpStatus.FORBIDDEN, "Forbidden!");
  }

  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      id: isValidToken.id,
    },
  });

  // hash password
  const password = await bcrypt.hash(payload.password, 12);
  // update into database
  await prisma.user.update({
    where: {
      id: userData.id,
    },
    data: {
      password,
    },
  });
  return { message: "Password reset successfully" };
};
const checkAuth = async (userId: string) => {
  const userData = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      packageBuyers: {
        select: {
          package: true,
        },
        take: 1,
        orderBy: {
          createdAt: "desc",
        },
      },
      conversations: {
        select: {
          id: true,
        },
      },
    },
  });
  return userData;
};
const updateToken = async (userId: string, token: string) => {
  const result = await prisma.user.update({
    where: { id: userId },
    data: { fcmToken: token },
  });
  return result;
};
export const AuthServices = {
  registerUser,
  loginUser,
  changePassword,
  forgotPassword,
  resetPassword,
  checkAuth,
  sendOTP,
  validateOtp,
  updateToken,
};
