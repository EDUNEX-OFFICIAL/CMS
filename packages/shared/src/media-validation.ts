import { ValidationError } from "./errors";

const IMAGE_MAX_BYTES = 10 * 1024 * 1024;
const VIDEO_MAX_BYTES = 50 * 1024 * 1024;
const PDF_MAX_BYTES = 20 * 1024 * 1024;

const ALLOWED_MIME_PREFIXES = ["image/"] as const;
const ALLOWED_MIME_EXACT = [
  "application/pdf",
  "video/mp4",
] as const;

export function isAllowedMimeType(mimeType: string): boolean {
  const normalized = mimeType.toLowerCase().trim();
  if (ALLOWED_MIME_EXACT.includes(normalized as (typeof ALLOWED_MIME_EXACT)[number])) {
    return true;
  }
  return ALLOWED_MIME_PREFIXES.some((prefix) => normalized.startsWith(prefix));
}

export function maxBytesForMimeType(mimeType: string): number {
  const normalized = mimeType.toLowerCase().trim();
  if (normalized.startsWith("image/")) {
    return IMAGE_MAX_BYTES;
  }
  if (normalized === "video/mp4") {
    return VIDEO_MAX_BYTES;
  }
  if (normalized === "application/pdf") {
    return PDF_MAX_BYTES;
  }
  return IMAGE_MAX_BYTES;
}

export function validateUploadRequest(input: {
  filename: string;
  mimeType: string;
  sizeBytes: number;
}): void {
  const filename = input.filename.trim();
  if (!filename || filename.length > 512) {
    throw new ValidationError("Invalid filename");
  }
  if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
    throw new ValidationError("Filename must not contain path separators");
  }

  const mimeType = input.mimeType.toLowerCase().trim();
  if (!isAllowedMimeType(mimeType)) {
    throw new ValidationError(`MIME type not allowed: ${mimeType}`);
  }

  if (!Number.isFinite(input.sizeBytes) || input.sizeBytes <= 0) {
    throw new ValidationError("sizeBytes must be a positive number");
  }

  const max = maxBytesForMimeType(mimeType);
  if (input.sizeBytes > max) {
    throw new ValidationError(
      `File exceeds maximum size of ${Math.round(max / (1024 * 1024))}MB for ${mimeType}`,
    );
  }
}

export function sanitizeStorageFilename(filename: string): string {
  const base = filename.trim().replace(/[/\\]+/g, "_");
  const safe = base.replace(/[^a-zA-Z0-9._-]/g, "_");
  return safe.slice(0, 200) || "file";
}
