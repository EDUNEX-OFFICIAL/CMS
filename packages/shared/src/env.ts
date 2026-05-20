import { z } from "zod";

function normalizePrivateKey(key: string): string {
  return key.replace(/\\n/g, "\n");
}

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  APP_NAME: z.string().default("CMS Platform"),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace"])
    .default("info"),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),
  API_PORT: z.coerce.number().int().positive().default(4000),
  CORS_ORIGIN: z.string().default("http://localhost:3000,http://localhost:3001"),
  QUEUE_PREFIX: z
    .string()
    .default("cms")
    .refine((value) => !value.includes(":"), {
      message: "QUEUE_PREFIX must not contain ':' (invalid for BullMQ queue names)",
    }),
  JWT_SECRET: z.string().min(8),
  FIREBASE_PROJECT_ID: z.string().min(1),
  FIREBASE_CLIENT_EMAIL: z.string().email(),
  FIREBASE_PRIVATE_KEY: z.string().min(1),
  SESSION_COOKIE_NAME: z.string().default("cms_session"),
  SESSION_TTL_SECONDS: z.coerce.number().int().positive().default(604800),
  WEB_APP_URL: z.string().url().default("http://localhost:3000"),
  S3_ACCESS_KEY: z.string().min(1).default("minio"),
  S3_SECRET_KEY: z.string().min(1).default("minio123"),
  S3_BUCKET: z.string().min(1).default("cms-dev"),
  S3_ENDPOINT: z.string().url().default("http://localhost:9000"),
  S3_REGION: z.string().default("us-east-1"),
  S3_PUBLIC_URL: z.string().url().optional(),
});

export type Env = z.infer<typeof envSchema>;

export type ParsedEnv = Env & {
  firebasePrivateKey: string;
  s3PublicUrl: string;
};

export function parseEnv(
  source: Record<string, string | undefined> = process.env,
): ParsedEnv {
  const parsed = envSchema.safeParse({
    ...source,
    DATABASE_URL: source.DATABASE_URL,
    REDIS_URL: source.REDIS_URL,
    JWT_SECRET: source.JWT_SECRET ?? "dev-only-change-me",
    FIREBASE_PROJECT_ID: source.FIREBASE_PROJECT_ID ?? "demo-project",
    FIREBASE_CLIENT_EMAIL:
      source.FIREBASE_CLIENT_EMAIL ?? "firebase-adminsdk@demo.iam.gserviceaccount.com",
    FIREBASE_PRIVATE_KEY:
      source.FIREBASE_PRIVATE_KEY ?? "-----BEGIN PRIVATE KEY-----\nDEMO\n-----END PRIVATE KEY-----\n",
    SESSION_COOKIE_NAME: source.SESSION_COOKIE_NAME,
    SESSION_TTL_SECONDS: source.SESSION_TTL_SECONDS,
    WEB_APP_URL: source.WEB_APP_URL,
    CORS_ORIGIN: source.CORS_ORIGIN,
    S3_ACCESS_KEY: source.S3_ACCESS_KEY,
    S3_SECRET_KEY: source.S3_SECRET_KEY,
    S3_BUCKET: source.S3_BUCKET,
    S3_ENDPOINT: source.S3_ENDPOINT,
    S3_REGION: source.S3_REGION,
    S3_PUBLIC_URL: source.S3_PUBLIC_URL,
  });

  if (!parsed.success) {
    const message = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(`Invalid environment configuration:\n${message}`);
  }

  const bucket = parsed.data.S3_BUCKET;
  const endpoint = parsed.data.S3_ENDPOINT.replace(/\/$/, "");
  const s3PublicUrl =
    parsed.data.S3_PUBLIC_URL ?? `${endpoint}/${bucket}`;

  return {
    ...parsed.data,
    firebasePrivateKey: normalizePrivateKey(parsed.data.FIREBASE_PRIVATE_KEY),
    s3PublicUrl,
  };
}

export function parseCorsOrigins(corsOrigin: string): string[] {
  return corsOrigin
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}
