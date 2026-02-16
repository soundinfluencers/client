export type ItemFieldKey = "mainLink" | "taggedUser" | "taggedLink";

export const INPUT_ID_TO_FIELD: Record<string, ItemFieldKey> = {
  "Contentlink*": "mainLink",
  "Content link*": "mainLink",
  "Content link": "mainLink",

  "Track link": "mainLink",
  "Track link*": "mainLink",

  "Link to music, events, news": "mainLink",
  "Link to music, events, news*": "mainLink",

  "Story tag": "taggedUser",
  "Story tag*": "taggedUser",

  "Story link": "taggedLink",
  "Story link*": "taggedLink",

  "Link to press realese": "taggedLink",
};

export const TEXTAREA_ID_TO_FIELD: Record<string, "additionalBrief"> = {
  "Additional brief": "additionalBrief",
  "Additional brief*": "additionalBrief",
};
