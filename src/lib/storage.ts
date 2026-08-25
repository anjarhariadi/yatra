import { mkdir, readFile, unlink, writeFile } from "fs/promises";
import path from "path";

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? "./data/uploads";

const MIME_BY_EXT: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

export const MAX_FILE_SIZE_IMAGE = 2 * 1024 * 1024;

// client strips the data-URL prefix before uploading, so sniff from magic bytes
export function sniffImageMime(data: Buffer): string | null {
  if (data.length < 12) return null;
  if (data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff)
    return "image/jpeg";
  if (
    data[0] === 0x89 &&
    data[1] === 0x50 &&
    data[2] === 0x4e &&
    data[3] === 0x47
  )
    return "image/png";
  if (data.toString("ascii", 0, 3) === "GIF") return "image/gif";
  if (
    data.toString("ascii", 0, 4) === "RIFF" &&
    data.toString("ascii", 8, 12) === "WEBP"
  )
    return "image/webp";
  return null;
}

async function ensureDir() {
  await mkdir(UPLOAD_DIR, { recursive: true });
}

export async function saveImage(
  data: Buffer,
  walletId: string,
): Promise<string> {
  const mimeType = sniffImageMime(data);
  if (!mimeType) {
    throw new Error("Only image uploads are allowed");
  }
  if (data.byteLength > MAX_FILE_SIZE_IMAGE) {
    throw new Error("Ukuran gambar tidak boleh lebih dari 2MB");
  }

  const ext = Object.keys(MIME_BY_EXT).find(
    (e) => MIME_BY_EXT[e] === mimeType,
  )!;
  const fileName = `${walletId}${ext}`;

  await ensureDir();
  await writeFile(path.join(UPLOAD_DIR, fileName), data);

  return `/api/files/${fileName}`;
}

export async function deleteImage(imageUrl: string): Promise<void> {
  const fileName = path.basename(imageUrl);
  try {
    await unlink(path.join(UPLOAD_DIR, fileName));
  } catch {
    // already gone; nothing to do
  }
}

export async function readImage(
  fileName: string,
): Promise<{ body: Buffer; contentType: string } | null> {
  const safeName = path.basename(fileName);
  const ext = path.extname(safeName).toLowerCase();
  const contentType = MIME_BY_EXT[ext];

  if (!contentType || safeName !== fileName) {
    return null;
  }

  try {
    const body = await readFile(path.join(UPLOAD_DIR, safeName));
    return { body, contentType };
  } catch {
    return null;
  }
}
