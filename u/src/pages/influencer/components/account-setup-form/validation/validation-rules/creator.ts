import { z } from "zod";
import { CONTENT_FOCUS_OPTIONS } from "@/pages/influencer/components/account-setup-form/components/checkbox-button-list/data/creator-categories.data.ts";
import { MUSIC_GENRES_CREATOR } from "@/pages/influencer/components/account-setup-form/components/checkbox-button-list/data/music-genres.data.ts";
import {
  collectLeafValues,
} from "@/pages/influencer/components/account-setup-form/components/checkbox-button-list/utils/tree-options.helpers.ts";

const creatorMusicGenreLeafValues = collectLeafValues(MUSIC_GENRES_CREATOR);
const creatorContentFocusLeafValues = collectLeafValues(CONTENT_FOCUS_OPTIONS);

export const requiredCreatorMusicGenres = z
.array(z.string())
.superRefine((values, ctx) => {
  if (!values.some((value) => creatorMusicGenreLeafValues.has(value))) {
    ctx.addIssue({
      code: "custom",
      path: [],
      message: "Select at least one option",
    });
  }
});

export const requiredCreatorContentFocus = z
.array(z.string())
.superRefine((values, ctx) => {
  if (!values.some((value) => creatorContentFocusLeafValues.has(value))) {
    ctx.addIssue({
      code: "custom",
      path: [],
      message: "Select at least one option",
    });
  }
});
