import {
  CreateBucketCommand,
  DeleteObjectCommand,
  HeadBucketCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getEnv } from "../config/env";

let client: S3Client | null = null;

export function getS3Client(): S3Client {
  if (!client) {
    const env = getEnv();
    client = new S3Client({
      region: env.S3_REGION,
      endpoint: env.S3_ENDPOINT,
      forcePathStyle: true,
      credentials: {
        accessKeyId: env.S3_ACCESS_KEY,
        secretAccessKey: env.S3_SECRET_KEY,
      },
    });
  }
  return client;
}

export function buildAssetStorageKey(
  workspaceId: string,
  assetId: string,
  filename: string,
): string {
  return `workspaces/${workspaceId}/assets/${assetId}/${filename}`;
}

export function getAssetPublicUrl(storageKey: string): string {
  const env = getEnv();
  const base = env.s3PublicUrl.replace(/\/$/, "");
  return `${base}/${storageKey}`;
}

export async function ensureS3Bucket(): Promise<void> {
  const env = getEnv();
  const s3 = getS3Client();
  try {
    await s3.send(new HeadBucketCommand({ Bucket: env.S3_BUCKET }));
  } catch {
    await s3.send(new CreateBucketCommand({ Bucket: env.S3_BUCKET }));
  }
}

export async function checkS3Connection(): Promise<void> {
  const env = getEnv();
  const s3 = getS3Client();
  await s3.send(new HeadBucketCommand({ Bucket: env.S3_BUCKET }));
}

export async function createPresignedPutUrl(
  storageKey: string,
  mimeType: string,
  expiresInSeconds = 900,
): Promise<{ uploadUrl: string; expiresAt: Date }> {
  const env = getEnv();
  const s3 = getS3Client();
  const command = new PutObjectCommand({
    Bucket: env.S3_BUCKET,
    Key: storageKey,
    ContentType: mimeType,
  });
  const uploadUrl = await getSignedUrl(s3, command, {
    expiresIn: expiresInSeconds,
  });
  return {
    uploadUrl,
    expiresAt: new Date(Date.now() + expiresInSeconds * 1000),
  };
}

export async function headStorageObject(storageKey: string): Promise<{
  contentType: string | undefined;
  contentLength: number | undefined;
}> {
  const env = getEnv();
  const s3 = getS3Client();
  const result = await s3.send(
    new HeadObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: storageKey,
    }),
  );
  return {
    contentType: result.ContentType,
    contentLength: result.ContentLength,
  };
}

export async function deleteStorageObject(storageKey: string): Promise<void> {
  const env = getEnv();
  const s3 = getS3Client();
  await s3.send(
    new DeleteObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: storageKey,
    }),
  );
}
