import type { NextFunction, Request, Response } from "express";
import {
  findUserById,
  toAuthUserDto,
} from "../modules/auth/repositories/user.repository";
import { verifySessionToken } from "../lib/session";
import { getEnv } from "../config/env";

export async function authenticateMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const env = getEnv();
    const token = req.cookies?.[env.SESSION_COOKIE_NAME] as string | undefined;
    if (!token) {
      next();
      return;
    }

    const session = await verifySessionToken(token);
    if (!session) {
      next();
      return;
    }

    const user = await findUserById(session.userId);
    if (!user) {
      next();
      return;
    }

    req.session = session;
    req.user = toAuthUserDto(user);
    next();
  } catch (error) {
    next(error);
  }
}
