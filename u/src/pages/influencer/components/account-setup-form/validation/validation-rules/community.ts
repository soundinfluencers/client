import { z } from "zod";

export const musicGenresSchema = z.object({
  genre: z.string().min(1),
  subGenres: z.array(z.string()),
});

export const requiredMusicGenres = z
.array(musicGenresSchema)
.min(1, { message: "Select at least 1 music genre" });
export const optionalThemeTopics = z.array(z.string()).optional().default([]);