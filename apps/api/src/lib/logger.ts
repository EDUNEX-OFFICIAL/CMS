import pino from "pino";
import { getEnv } from "../config/env";

export const logger = pino({
  level: getEnv().LOG_LEVEL,
});
