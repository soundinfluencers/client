import { z } from "zod";
import { MUSIC_GENRES_COMMUNITY } from "@/pages/influencer/components/account-setup-form/components/checkbox-button-list/data/music-genres.data.ts";
import {
  collectLeafValues,
} from "@/pages/influencer/components/account-setup-form/components/checkbox-button-list/utils/tree-options.helpers.ts";

const communityMusicGenreLeafValues = collectLeafValues(MUSIC_GENRES_COMMUNITY);

export const requiredCommunityMusicGenres = z
.array(z.string())
.superRefine((values, ctx) => {
  if (!values.some((value) => communityMusicGenreLeafValues.has(value))) {
    ctx.addIssue({
      code: "custom",
      path: [],
      message: "Select at least 1 music genre",
    });
  }
});

export const optionalCommunityThemeTopics = z
.array(z.string())
.optional()
.default([]);
