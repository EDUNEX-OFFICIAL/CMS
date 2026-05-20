import { randomUUID } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import type { SessionPayload } from "@repo/types";
import { getEnv } from "../config/env";
import { getRedis } from "./redis";

function secretKey() {
  return new TextEncoder().encode(getEnv().JWT_SECRET);
}

function sessionRedisKey(sessionId: string) {
  return `session:${sessionId}`;
}

export async function createSession(
  userId: string,
  activeWorkspaceId?: string,
): Promise<{ sessionId: string; token: string; payload: SessionPayload }> {
  const env = getEnv();
  const sessionId = randomUUID();
  const payload: SessionPayload = {
    userId,
    sessionId,
    activeWorkspaceId,
  };

  const redis = getRedis();
  await redis.set(
    sessionRedisKey(sessionId),
    JSON.stringify({ userId, activeWorkspaceId }),
    "EX",
    env.SESSION_TTL_SECONDS,
  );

  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${env.SESSION_TTL_SECONDS}s`)
    .sign(secretKey());

  return { sessionId, token, payload };
}

export async function verifySessionToken(
  token: string,
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey());
    const sessionId = payload.sessionId as string | undefined;
    const userId = payload.userId as string | undefined;
    if (!sessionId || !userId) {
      return null;
    }

    const redis = getRedis();
    const stored = await redis.get(sessionRedisKey(sessionId));
    if (!stored) {
      return null;
    }

    const parsed = JSON.parse(stored) as {
      userId: string;
      activeWorkspaceId?: string;
    };
    if (parsed.userId !== userId) {
      return null;
    }

    return {
      userId,
      sessionId,
      activeWorkspaceId:
        (payload.activeWorkspaceId as string | undefined) ??
        parsed.activeWorkspaceId,
    };
  } catch {
    return null;
  }
}

export async function updateSessionWorkspace(
  sessionId: string,
  userId: string,
  activeWorkspaceId: string | undefined,
): Promise<SessionPayload | null> {
  const env = getEnv();
  const redis = getRedis();
  const key = sessionRedisKey(sessionId);
  const stored = await redis.get(key);
  if (!stored) {
    return null;
  }

  const parsed = JSON.parse(stored) as { userId: string };
  if (parsed.userId !== userId) {
    return null;
  }

  await redis.set(
    key,
    JSON.stringify({ userId, activeWorkspaceId }),
    "EX",
    env.SESSION_TTL_SECONDS,
  );

  return { userId, sessionId, activeWorkspaceId };
}

export async function destroySession(sessionId: string): Promise<void> {
  await getRedis().del(sessionRedisKey(sessionId));
}

export function sessionCookieOptions() {
  const env = getEnv();
  return {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: env.SESSION_TTL_SECONDS * 1000,
    path: "/",
  };
}

export async function reissueSessionToken(
  payload: SessionPayload,
): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${getEnv().SESSION_TTL_SECONDS}s`)
    .sign(secretKey());
}
