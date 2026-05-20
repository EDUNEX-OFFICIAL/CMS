process.env.NODE_ENV = "test";
process.env.DATABASE_URL =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5433/cms_dev";
process.env.REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6379";
process.env.JWT_SECRET = "test-secret-key-min-8-chars";
process.env.API_PORT = "4000";
process.env.LOG_LEVEL = "error";
process.env.CORS_ORIGIN = "http://localhost:3000";
process.env.QUEUE_PREFIX = "cms";
process.env.FIREBASE_PROJECT_ID = "test-project";
process.env.FIREBASE_CLIENT_EMAIL = "test@test.iam.gserviceaccount.com";
process.env.FIREBASE_PRIVATE_KEY =
  "-----BEGIN PRIVATE KEY-----\nTEST\n-----END PRIVATE KEY-----\n";
process.env.SESSION_COOKIE_NAME = "cms_session";
process.env.SESSION_TTL_SECONDS = "604800";
process.env.WEB_APP_URL = "http://localhost:3000";
