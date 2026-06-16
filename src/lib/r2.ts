import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT || "https://placeholder.r2.cloudflarestorage.com",
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "placeholder",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "placeholder",
  },
});

const BUCKET = process.env.R2_BUCKET_NAME || "kuwait-events";
const PUBLIC_URL = process.env.R2_PUBLIC_URL || "https://cdn.kuwaitevents.com";

export async function getPresignedUploadUrl(
  filename: string,
  contentType: string,
  folder: "events" | "avatars" | "categories" = "events"
) {
  if (process.env.NODE_ENV === "production" && (!process.env.R2_ACCESS_KEY_ID || process.env.R2_ACCESS_KEY_ID === "placeholder")) {
    throw new Error("R2 credentials are required in production");
  }

  const ext = filename.split(".").pop();
  const key = `${folder}/${randomUUID()}-${filename.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  });

  const presignedUrl = await getSignedUrl(s3Client, command, {
    expiresIn: 3600, // 1 hour
  });

  const publicUrl = `${PUBLIC_URL}/${key}`;

  return { presignedUrl, publicUrl, key };
}
