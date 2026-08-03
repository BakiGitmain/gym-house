import imageCompression from "browser-image-compression";

export const MAX_ORIGINAL_IMAGE_BYTES =
  20 * 1024 * 1024;

const MAX_COMPRESSED_IMAGE_BYTES =
  2 * 1024 * 1024;

export async function compressProfileImage(
  file: File,
): Promise<File> {
  // Small images do not need extra compression.
  if (
    file.size <=
    MAX_COMPRESSED_IMAGE_BYTES
  ) {
    return file;
  }

  return imageCompression(file, {
    maxSizeMB: 2,
    maxWidthOrHeight: 1600,
    initialQuality: 0.82,
    maxIteration: 10,
    useWebWorker: true,
    preserveExif: false,
  });
}