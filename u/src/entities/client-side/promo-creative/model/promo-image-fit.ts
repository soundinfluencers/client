import {
  MAX_IMAGE_EDGE,
  MAX_IMAGE_PIXELS,
} from "./promo-image-validation.ts";

/**
 * Shrink a photo to what the image service will actually accept.
 *
 * A camera frame is typically 24 MP, and gpt-image-2 answers those with a bare
 * "Invalid image file or mode" that says nothing a client could act on. Resizing here turns
 * the common case into a working edit instead of a rejection, and the canvas round trip also
 * flattens the source to 8-bit sRGB, which covers the colour-mode half of that same refusal.
 *
 * Anything already within the limits is returned untouched — no needless re-encode.
 */

// Quality is deliberately high: the result is the model's reference photo, and banding in the
// source shows up in the poster.
const JPEG_QUALITY = 0.9;

type Dimensions = { width: number; height: number };

/**
 * Both limits bind, and for an ordinary 3:2 frame it is the pixel budget that bites first:
 * 6000 × 4000 scaled to the 3840 edge is still 9.8 MP, over the 8.3 MP ceiling.
 */
export const promoImageScale = ({ width, height }: Dimensions): number =>
  Math.min(
    1,
    MAX_IMAGE_EDGE / Math.max(width, height),
    Math.sqrt(MAX_IMAGE_PIXELS / (width * height)),
  );

export const promoImageTarget = (source: Dimensions): Dimensions => {
  const scale = promoImageScale(source);
  return {
    width: Math.max(1, Math.floor(source.width * scale)),
    height: Math.max(1, Math.floor(source.height * scale)),
  };
};

const readDimensions = (file: File): Promise<Dimensions> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    const release = () => URL.revokeObjectURL(url);
    image.onload = () => {
      const dimensions = { width: image.naturalWidth, height: image.naturalHeight };
      release();
      resolve(dimensions);
    };
    image.onerror = () => {
      release();
      reject(new Error("unreadable"));
    };
    image.src = url;
  });

/**
 * Decode straight to the target size where the browser supports it. Decoding a 24 MP frame at
 * full size first would allocate about 96 MB of bitmap, which is enough to kill a phone tab.
 */
const decodeAt = async (file: File, target: Dimensions): Promise<ImageBitmap> => {
  try {
    const bitmap = await createImageBitmap(file, {
      resizeWidth: target.width,
      resizeHeight: target.height,
      resizeQuality: "high",
    });
    if (bitmap.width === target.width && bitmap.height === target.height) return bitmap;
    bitmap.close?.();
  } catch {
    // Older engines ignore or reject the resize options; fall through and scale on the canvas.
  }
  return createImageBitmap(file);
};

// Only PNG carries transparency here, and JPEG cannot. Flatten onto white rather than letting
// the canvas default of transparent-black turn a logo's background into a black slab.
const mayHaveAlpha = (file: File): boolean => file.type === "image/png";

export const fitPromoImage = async (file: File): Promise<File> => {
  if (typeof createImageBitmap !== "function") return file;

  let source: Dimensions;
  try {
    source = await readDimensions(file);
  } catch {
    // Not decodable here; inspectPromoImage owns the error message for that.
    return file;
  }

  const target = promoImageTarget(source);
  if (target.width === source.width && target.height === source.height) return file;

  let bitmap: ImageBitmap;
  try {
    bitmap = await decodeAt(file, target);
  } catch {
    return file;
  }

  try {
    const canvas = document.createElement("canvas");
    canvas.width = target.width;
    canvas.height = target.height;
    const context = canvas.getContext("2d");
    if (!context) return file;
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    if (mayHaveAlpha(file)) {
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, target.width, target.height);
    }
    context.drawImage(bitmap, 0, 0, target.width, target.height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY),
    );
    if (!blob?.size) return file;

    const name = file.name.replace(/\.[^.]+$/, "") || "photo";
    return new File([blob], `${name}.jpg`, {
      type: "image/jpeg",
      lastModified: file.lastModified,
    });
  } finally {
    bitmap.close?.();
  }
};
