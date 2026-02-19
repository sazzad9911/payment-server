import { NextFunction, Request, Response } from "express";

import config from "../../config";
import { JwtPayload, Secret } from "jsonwebtoken";

import httpStatus from "http-status";
import ApiError from "../../errors/ApiErrors";
import { jwtHelpers } from "../../helpars/jwtHelpers";
import prisma from "../../shared/prisma";

const auth = (...roles: string[]) => {
  return async (
    req: Request & { user?: any },
    _res: Response,
    next: NextFunction,
  ) => {
    try {
      let token = req.headers.authorization;

      if (!token) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "You are not authorized!");
      }

      // Remove "Bearer " prefix if present
      if (token.startsWith("Bearer ")) {
        token = token.split(" ")[1];
      }

      const verifiedUser = jwtHelpers.verifyToken(
        token,
        config.jwt.jwt_secret as Secret,
      );
      const { id, role, uid, iat } = verifiedUser;

      const user = await prisma.user.findUnique({
        where: {
          id: id,
        },
      });

      if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, "User not found!");
      }
      if (user.activeTokenId !== uid && user.role !== "ADMIN") {
        throw new ApiError(
          httpStatus.UNAUTHORIZED,
          "User active at another device. Please log in again.",
        );
      }
      if (user.status === "BLOCKED") {
        throw new ApiError(httpStatus.FORBIDDEN, "Your account is blocked!");
      }

      if (user.passwordChangedAt) {
        const passwordChangedAt =
          new Date(user.passwordChangedAt).getTime() / 1000;
        const tokenIssuedAt = iat; // iat is in seconds

        if (tokenIssuedAt && tokenIssuedAt < passwordChangedAt) {
          return next(
            new ApiError(
              httpStatus.UNAUTHORIZED,
              "Token expired due to password change. Please log in again.",
            ),
          );
        }
      }

      req.user = verifiedUser as JwtPayload;

      if (roles.length && !roles.includes(verifiedUser.role)) {
        throw new ApiError(httpStatus.FORBIDDEN, "Forbidden!");
      }
      next();
    } catch (err) {
      next(err);
    }
  };
};

export default auth;
