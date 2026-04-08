import type { CardField } from "@/pages/influencer/negotiation/types/negotiation.config.types.ts";
import type { CountryItem, MusicGenreItem, SocialAccountDraft } from "@/types/user/influencer.types.ts";
import { getCurrencySymbol } from "@/pages/influencer/negotiation/utils/getCurrencySymbol.ts";

import './_card-field-render.scss';

const renderCountries = (countries: CountryItem[]) => {
  if (!countries?.length) return "N/A";

  return (
    <div className="chips">
      {countries.map((c) => {
        if (!c.country) return null;

        return (
          <span key={c.country} className="chip">
            {c.country}
            {c.percentage ? ` ${c.percentage}%` : ""}
          </span>
        );
      })}
    </div>
  );
};

const renderGenres = (genres: MusicGenreItem[]) => {
  if (!genres?.length) return "N/A";

  const chips: string[] = [];

  genres.forEach((g) => {
    if (!g.subGenres?.length) {
      chips.push(g.genre);
      return;
    }

    g.subGenres.forEach((sub) => {
      chips.push(`${g.genre} ${sub}`);
    });
  });

  return (
    <div className="chips">
      {chips.map((label) => (
        <span key={label} className="chip">
          {label}
        </span>
      ))}
    </div>
  );
};

const renderStringChips = (items: string[]) => {
  const chips = (items ?? []).map((x) => x?.trim()).filter(Boolean);
  if (!chips.length) return "N/A";

  return (
    <div className="chips">
      {chips.map((label) => (
        <span key={label} className="chip">
          {label}
        </span>
      ))}
    </div>
  );
};

export const renderValue = (field: CardField, account: SocialAccountDraft) => {
  const v = account[field.key];

  if (v == null) return "N/A";

  switch (field.type) {
    case "link":
      return (
        <a href={String(v)} target="_blank" rel="noreferrer" className={'link'}>
          {String(v)}
        </a>
      );

    case "chips":
      return renderGenres(v as MusicGenreItem[]);

    case "stringChips":
      return renderStringChips(v as string[]);

    case "countries":
      return renderCountries(v as CountryItem[]);

    case "price":
      return `${v}${getCurrencySymbol(account.currency)}`;

    default:
      return String(v);
  }
};


