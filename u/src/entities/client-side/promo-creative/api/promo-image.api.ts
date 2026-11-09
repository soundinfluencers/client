import axios from "axios";
import $api from "@/api/api.ts";
import { AGENT_QUEUE_ENABLED } from "@/shared/config/runtime-config.ts";
import { awaitQueuedReply, TerminalRunError } from "@/api/agent/agent-queue.api.ts";

type GeneratedImageDto = {
  base64: string;
  mimeType: string;
};

type PromoImageResponseDto = {
  images: GeneratedImageDto[];
  model: string;
};

export class PromoImageError extends Error {
  readonly code?: string;
  readonly status?: number;

  constructor(message: string, code?: string, status?: number) {
    super(message);
    this.name = "PromoImageError";
    this.code = code;
    this.status = status;
  }
}

// The server sends a typed code with every expected failure. Anything else is a
// surprise: keep the wording generic for the client, but log the real cause.
const FALLBACK_MESSAGE =
  "The visual directions could not be created. Try again in a moment.";

const toPromoImageError = (error: unknown) => {
  if (!axios.isAxiosError(error)) return new PromoImageError(FALLBACK_MESSAGE);

  const status = error.response?.status;
  const body = error.response?.data as
    | { code?: string; message?: string | string[] }
    | undefined;

  if (!error.response) {
    return new PromoImageError(
      "No connection to the server. Check your network and try again.",
      undefined,
      status,
    );
  }

  const serverMessage = Array.isArray(body?.message)
    ? body?.message.join(" ")
    : body?.message;

  if (!body?.code) {
    console.error("Promo image request failed", { status, body });
  }

  return new PromoImageError(
    body?.code && serverMessage ? serverMessage : FALLBACK_MESSAGE,
    body?.code,
    status,
  );
};

export const createPromoImageDirections = async ({
  prompt,
  source,
  fidelity,
}: {
  prompt: string;
  source?: File;
  fidelity?: "low" | "high";
}) => {
  const form = new FormData();
  form.append("prompt", prompt);
  form.append("count", "3");
  form.append("quality", "low");
  form.append("size", "1024x1536");
  if (source) {
    form.append("image", source);
    if (fidelity) form.append("fidelity", fidelity);
  }
  try {
    if (AGENT_QUEUE_ENABLED) {
      const requestId = crypto.randomUUID();
      let attachmentId: string | undefined;
      if (source) {
        const upload = new FormData();
        upload.append("image", source);
        attachmentId = (await $api.post(`/agent/v1/promo-attachments/${requestId}`, upload, {
          headers: { "Content-Type": "multipart/form-data" },
        })).data.data.attachmentId;
      }
      const { runId, conversationId } = (await $api.post("/agent/v1/promo-runs", {
        requestId, prompt, attachmentId, fidelity, count: 3, size: "1024x1536", quality: "low",
      })).data.data;
      const { promo } = await awaitQueuedReply(conversationId, runId);
      if (!promo?.count) throw new PromoImageError(FALLBACK_MESSAGE);
      const files = await Promise.all(Array.from({ length: promo.count }, async (_, index) => {
        const image = await $api.get<Blob>(`/agent/v1/runs/${runId}/promo-images/${index}`, { responseType: "blob" });
        return new File([image.data], `promo-direction-${index + 1}.jpg`, { type: "image/jpeg" });
      }));
      return { model: promo.model, files };
    }
    const response = await $api.post("/agent/promo-images", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    const payload = response.data.data as PromoImageResponseDto;
    return {
      model: payload.model,
      files: payload.images.map(base64ToFile),
    };
  } catch (error) {
    if (error instanceof TerminalRunError && error.message === "promo_result_unknown_retry") {
      throw new PromoImageError("The previous generation could not be confirmed. Start a new generation to retry.", error.message);
    }
    if (error instanceof PromoImageError) throw error;
    throw toPromoImageError(error);
  }
};

const base64ToFile = (image: GeneratedImageDto, index: number) => {
  const binary = atob(image.base64);
  const bytes = new Uint8Array(binary.length);
  for (let offset = 0; offset < binary.length; offset += 1) {
    bytes[offset] = binary.charCodeAt(offset);
  }
  const extension = image.mimeType === "image/png" ? "png" : "jpg";
  return new File([bytes], `openai-promo-direction-${index + 1}.${extension}`, {
    type: image.mimeType,
  });
};
