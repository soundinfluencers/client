import type { PromoCreativeSource } from "@/entities/client-side/campaign-draft/api/campaign-draft.dto.ts";

export type PromoImageDetails = {
  width: number;
  height: number;
  mimeType: string;
};

export const MAX_PROMO_IMAGE_BYTES = 15 * 1024 * 1024;
export const MAX_PROMO_IMAGE_MB = MAX_PROMO_IMAGE_BYTES / 1024 / 1024;
const MIN_IMAGE_EDGE = 512;
// gpt-image-2 refuses anything past these with a bare "Invalid image file or mode", so we
// stop it here where we can say which limit was missed and by how much.
export const MAX_IMAGE_EDGE = 3840;
export const MAX_IMAGE_PIXELS = 8_294_400;
const MIN_PROMO_ASPECT_RATIO = 1 / 2;
const MAX_PROMO_ASPECT_RATIO = 2;
const ACCEPTED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

// The `accept` value for every image picker. Keep it in step with ACCEPTED_IMAGE_TYPES, and
// never add image/heic: Safari 17+ reads that as permission to convert JPEG and PNG *into*
// HEIC, which breaks the iOS path that currently works.
export const ACCEPTED_IMAGE_ACCEPT = "image/jpeg,image/png,image/webp";

// ISO base media containers we can name but not process. `heic` and friends are what an
// iPhone writes by default.
const UNSUPPORTED_CONTAINERS: Record<string, string> = {
  heic: "HEIC",
  heix: "HEIC",
  heim: "HEIC",
  heis: "HEIC",
  hevc: "HEIC",
  hevm: "HEIC",
  hevs: "HEIC",
  hevx: "HEIC",
  mif1: "HEIF",
  msf1: "HEIF",
  avif: "AVIF",
  avis: "AVIF",
};

/**
 * Windows registers no MIME type for `.heic`, so `file.type` is an empty string and an iPhone
 * photo falls through the format guard to the byte sniffer, which reports it as unreadable.
 * Read the container brand instead, so the message says what to actually do about it.
 */
const detectUnsupportedContainer = (bytes: Uint8Array): string | null => {
  if (bytes.length < 12) return null;
  const box = String.fromCharCode(...bytes.slice(4, 8));
  if (box !== "ftyp") return null;
  const brand = String.fromCharCode(...bytes.slice(8, 12)).toLowerCase();
  return UNSUPPORTED_CONTAINERS[brand] ?? null;
};

const detectImageType = (bytes: Uint8Array): string | null => {
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return "image/png";
  }
  if (
    bytes.length >= 3 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff
  ) {
    return "image/jpeg";
  }
  if (
    bytes.length >= 12 &&
    String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
  ) {
    return "image/webp";
  }
  return null;
};

const readImageDimensions = (
  file: File,
): Promise<Pick<PromoImageDetails, "width" | "height">> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    const release = () => URL.revokeObjectURL(url);
    image.onload = () => {
      const dimensions = {
        width: image.naturalWidth,
        height: image.naturalHeight,
      };
      release();
      resolve(dimensions);
    };
    image.onerror = () => {
      release();
      reject(
        new Error(
          "The image could not be read. Export it again as JPG, PNG, or WebP.",
        ),
      );
    };
    image.src = url;
  });

export const inspectPromoImage = async (
  file: File,
  method: PromoCreativeSource,
): Promise<PromoImageDetails> => {
  if (!file.size) throw new Error("The image is empty.");
  if (file.size > MAX_PROMO_IMAGE_BYTES)
    throw new Error(`Choose an image no larger than ${MAX_PROMO_IMAGE_MB} MB.`);
  const header = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const container = detectUnsupportedContainer(header);
  if (container) {
    throw new Error(
      `${container} photos are not supported. Send this one as JPG, PNG, or WebP` +
        (container === "AVIF"
          ? "."
          : " — on iPhone: Settings > Camera > Formats > Most Compatible."),
    );
  }

  if (file.type && !ACCEPTED_IMAGE_TYPES.has(file.type)) {
    throw new Error("Use a JPG, PNG, or WebP image.");
  }

  const mimeType = detectImageType(header);
  if (!mimeType) {
    throw new Error(
      "The image could not be read. Export it again as JPG, PNG, or WebP.",
    );
  }
  if (file.type && file.type !== mimeType) {
    throw new Error(
      "The image contents do not match its file type. Export it again.",
    );
  }

  const { width, height } = await readImageDimensions(file);
  if (width < MIN_IMAGE_EDGE || height < MIN_IMAGE_EDGE) {
    throw new Error(
      `Use an image of at least ${MIN_IMAGE_EDGE} × ${MIN_IMAGE_EDGE} px. ` +
        `This one is ${width} × ${height} px.`,
    );
  }
  if (
    width > MAX_IMAGE_EDGE ||
    height > MAX_IMAGE_EDGE ||
    width * height > MAX_IMAGE_PIXELS
  ) {
    throw new Error(
      `This photo is ${width} × ${height} px, which the image service will not accept. ` +
        `Use at most ${MAX_IMAGE_EDGE} px on either side and ` +
        `${(MAX_IMAGE_PIXELS / 1_000_000).toFixed(1)} megapixels in total — ` +
        `resize it and try again.`,
    );
  }

  const aspectRatio = width / height;
  if (
    method === "upload" &&
    (aspectRatio < MIN_PROMO_ASPECT_RATIO ||
      aspectRatio > MAX_PROMO_ASPECT_RATIO)
  ) {
    throw new Error(
      "Use a standard square, portrait, story, or landscape format (between 1:2 and 2:1).",
    );
  }
  return { width, height, mimeType };
};
