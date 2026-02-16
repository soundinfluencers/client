import {
  mainPlatforms,
  musicPlatforms,
  pressPlatforms,
} from "@/client-side/constants/plattforms-data-form";

export const groupPlatforms = (platforms: string[]) => {
  return {
    main: platforms.filter((p) => mainPlatforms.includes(p)),
    music: platforms.filter((p) => musicPlatforms.includes(p)),
    press: platforms.filter((p) => pressPlatforms.includes(p)),
  };
};
