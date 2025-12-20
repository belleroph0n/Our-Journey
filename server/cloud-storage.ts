import { Storage } from "@google-cloud/storage";
import fs from "fs";
import path from "path";

const REPLIT_SIDECAR_ENDPOINT = "http://127.0.0.1:1106";

const storage = new Storage({
  credentials: {
    audience: "replit",
    subject_token_type: "access_token",
    token_url: `${REPLIT_SIDECAR_ENDPOINT}/token`,
    type: "external_account",
    credential_source: {
      url: `${REPLIT_SIDECAR_ENDPOINT}/credential`,
      format: {
        type: "json",
        subject_token_field_name: "access_token",
      },
    },
    universe_domain: "googleapis.com",
  },
  projectId: "",
});

function getBucketName(): string {
  const publicPaths = process.env.PUBLIC_OBJECT_SEARCH_PATHS || "";
  const firstPath = publicPaths.split(",")[0]?.trim();
  if (!firstPath) {
    throw new Error("PUBLIC_OBJECT_SEARCH_PATHS not configured");
  }
  const parts = firstPath.split("/").filter(Boolean);
  return parts[0] || "";
}

function getPublicPrefix(): string {
  const publicPaths = process.env.PUBLIC_OBJECT_SEARCH_PATHS || "";
  const firstPath = publicPaths.split(",")[0]?.trim();
  if (!firstPath) {
    return "public";
  }
  const parts = firstPath.split("/").filter(Boolean);
  return parts.slice(1).join("/") || "public";
}

export async function uploadToCloudStorage(
  filename: string,
  buffer: Buffer,
  contentType: string
): Promise<string> {
  const bucketName = getBucketName();
  const prefix = getPublicPrefix();
  const objectPath = `${prefix}/media/${filename}`;

  const bucket = storage.bucket(bucketName);
  const file = bucket.file(objectPath);

  await file.save(buffer, {
    contentType,
    metadata: {
      cacheControl: "public, max-age=31536000",
    },
  });

  return objectPath;
}

export async function getFromCloudStorage(
  filename: string
): Promise<{ buffer: Buffer; contentType: string } | null> {
  try {
    const bucketName = getBucketName();
    const prefix = getPublicPrefix();
    const objectPath = `${prefix}/media/${filename}`;

    const bucket = storage.bucket(bucketName);
    const file = bucket.file(objectPath);

    const [exists] = await file.exists();
    if (!exists) {
      return null;
    }

    const [buffer] = await file.download();
    const [metadata] = await file.getMetadata();

    return {
      buffer: buffer,
      contentType: (metadata.contentType as string) || "application/octet-stream",
    };
  } catch (error) {
    console.error("Error fetching from cloud storage:", error);
    return null;
  }
}

export async function streamFromCloudStorage(
  filename: string
): Promise<{
  stream: NodeJS.ReadableStream;
  contentType: string;
  size: number;
} | null> {
  try {
    const bucketName = getBucketName();
    const prefix = getPublicPrefix();
    const objectPath = `${prefix}/media/${filename}`;

    const bucket = storage.bucket(bucketName);
    const file = bucket.file(objectPath);

    const [exists] = await file.exists();
    if (!exists) {
      return null;
    }

    const [metadata] = await file.getMetadata();
    const stream = file.createReadStream();

    return {
      stream,
      contentType: (metadata.contentType as string) || "application/octet-stream",
      size: parseInt(metadata.size as string, 10) || 0,
    };
  } catch (error) {
    console.error("Error streaming from cloud storage:", error);
    return null;
  }
}

export async function listCloudStorageFiles(): Promise<string[]> {
  try {
    const bucketName = getBucketName();
    const prefix = getPublicPrefix();
    const mediaPrefix = `${prefix}/media/`;

    const bucket = storage.bucket(bucketName);
    const [files] = await bucket.getFiles({ prefix: mediaPrefix });

    return files.map((file) => path.basename(file.name));
  } catch (error) {
    console.error("Error listing cloud storage files:", error);
    return [];
  }
}

export async function deleteFromCloudStorage(filename: string): Promise<boolean> {
  try {
    const bucketName = getBucketName();
    const prefix = getPublicPrefix();
    const objectPath = `${prefix}/media/${filename}`;

    const bucket = storage.bucket(bucketName);
    const file = bucket.file(objectPath);

    await file.delete();
    return true;
  } catch (error) {
    console.error("Error deleting from cloud storage:", error);
    return false;
  }
}

export async function uploadMemoriesFileToCloud(
  buffer: Buffer,
  originalFilename: string
): Promise<string> {
  const bucketName = getBucketName();
  const prefix = getPublicPrefix();
  const ext = path.extname(originalFilename);
  const objectPath = `${prefix}/memories${ext}`;

  const bucket = storage.bucket(bucketName);
  
  // Delete any existing memories files
  const [files] = await bucket.getFiles({ prefix: `${prefix}/memories` });
  for (const file of files) {
    if (file.name.startsWith(`${prefix}/memories.`)) {
      await file.delete();
    }
  }

  const file = bucket.file(objectPath);
  const contentType = ext === ".csv" 
    ? "text/csv" 
    : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

  await file.save(buffer, {
    contentType,
  });

  return objectPath;
}

export async function getMemoriesFileFromCloud(): Promise<{
  buffer: Buffer;
  filename: string;
} | null> {
  try {
    const bucketName = getBucketName();
    const prefix = getPublicPrefix();

    const bucket = storage.bucket(bucketName);
    const [files] = await bucket.getFiles({ prefix: `${prefix}/memories` });

    const memoriesFile = files.find((file) =>
      file.name.match(/\/memories\.(xlsx|xls|csv)$/i)
    );

    if (!memoriesFile) {
      return null;
    }

    const [buffer] = await memoriesFile.download();
    return {
      buffer,
      filename: path.basename(memoriesFile.name),
    };
  } catch (error) {
    console.error("Error fetching memories file from cloud:", error);
    return null;
  }
}

export async function migrateLocalFilesToCloud(): Promise<{
  migrated: string[];
  errors: string[];
}> {
  const migrated: string[] = [];
  const errors: string[] = [];

  const localMediaDir = path.join(process.cwd(), "uploads", "media");
  const localUploadsDir = path.join(process.cwd(), "uploads");

  // Migrate media files
  if (fs.existsSync(localMediaDir)) {
    const files = fs.readdirSync(localMediaDir);
    for (const file of files) {
      try {
        const filePath = path.join(localMediaDir, file);
        const buffer = fs.readFileSync(filePath);
        const ext = path.extname(file).toLowerCase();
        
        let contentType = "application/octet-stream";
        if ([".jpg", ".jpeg"].includes(ext)) contentType = "image/jpeg";
        else if (ext === ".png") contentType = "image/png";
        else if (ext === ".gif") contentType = "image/gif";
        else if (ext === ".webp") contentType = "image/webp";
        else if (ext === ".mp4") contentType = "video/mp4";
        else if (ext === ".mov") contentType = "video/quicktime";
        else if (ext === ".avi") contentType = "video/x-msvideo";
        else if (ext === ".webm") contentType = "video/webm";
        else if (ext === ".mp3") contentType = "audio/mpeg";
        else if (ext === ".wav") contentType = "audio/wav";
        else if (ext === ".m4a") contentType = "audio/mp4";
        else if (ext === ".aac") contentType = "audio/aac";

        await uploadToCloudStorage(file, buffer, contentType);
        migrated.push(file);
      } catch (error: any) {
        errors.push(`${file}: ${error.message}`);
      }
    }
  }

  // Migrate memories file
  if (fs.existsSync(localUploadsDir)) {
    const files = fs.readdirSync(localUploadsDir);
    const memoriesFile = files.find((f) => f.startsWith("memories."));
    if (memoriesFile) {
      try {
        const filePath = path.join(localUploadsDir, memoriesFile);
        const buffer = fs.readFileSync(filePath);
        await uploadMemoriesFileToCloud(buffer, memoriesFile);
        migrated.push(memoriesFile);
      } catch (error: any) {
        errors.push(`${memoriesFile}: ${error.message}`);
      }
    }
  }

  return { migrated, errors };
}

export function isCloudStorageConfigured(): boolean {
  return !!(
    process.env.PUBLIC_OBJECT_SEARCH_PATHS &&
    process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID
  );
}
