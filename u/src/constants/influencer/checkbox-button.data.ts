export interface ICheckboxButton {
  id: string;
  label: string;
  value: string;
  children?: ICheckboxButton[];
}

// COMMUNITY CHECKBOX BUTTONS DATA
export const MUSIC_GENERS_DATA: ICheckboxButton[] = [
  {
    id: "techno",
    label: "Techno",
    value: "techno",
    children: [
      {
        id: "techno-melodic",
        label: "Melodic, Minimal",
        value: "melodic_minimal",
      },
      {
        id: "techno-hard",
        label: "Hard, Peak",
        value: "hard_peak",
      },
    ],
  },
  {
    id: "house",
    label: "House",
    value: "house",
    children: [
      {
        id: "tech-house",
        label: "Tech House",
        value: "tech_house",
      },
      { id: "melodic-house", label: "Melodic House", value: "melodic_house" },
      { id: "afro-house", label: "Afro House", value: "afro_house" },
    ],
  },
  {
    id: "edm",
    label: "EDM",
    value: "edm",
  },
  {
    id: "d&b",
    label: "D&B",
    value: "d&b",
  },
  { id: "bass", label: "Bass", value: "bass" },
  { id: "psy-trance", label: "Psy, Trance", value: "psy_trance" },
  { id: "dubstep", label: "Dubstep", value: "dubstep" },
  { id: "pop", label: "Pop", value: "pop" },
  { id: "hip-hop", label: "Hip-Hop", value: "hip_hop" },
];

export const THEME_TOPICS_DATA: ICheckboxButton[] = [
  { id: "ibiza", label: "Ibiza", value: "ibiza" },
  { id: "dancing", label: "Dancing", value: "dancing" },
  { id: "meme", label: "Meme", value: "meme" },
];

// CREATOR CHECKBOX BUTTONS DATA
export const ENTERTAINMENT_CATEGORIES_DATA: ICheckboxButton[] = [
  {id: 'lifestyle', label: 'Lifestyle', value: 'lifestyle'},
  {id: 'fashion', label: 'Fashion', value: 'fashion'},
  {id: 'fitness', label: 'Fitness', value: 'fitness'},
  {id: 'beauty', label: 'Beauty', value: 'beauty'},
  {id: 'cosplay', label: 'Cosplay', value: 'cosplay'},
  {id: 'comedy', label: 'Comedy', value: 'comedy'},
  {id: 'family', label: 'Family', value: 'family'},
];

export const MUSIC_CATEGORIES_DATA: ICheckboxButton[] = [
  {id: 'dance', label: 'Dance', value: 'dance'},
  {id: 'music', label: 'Music', value: 'music'},
  {id: 'lipsync', label: 'Lipsync', value: 'lipsync'},
  {id: 'reactions', label: 'Reactions', value: 'reactions'},
  {id: 'lyrics', label: 'Lyrics', value: 'lyrics'},
];