export const defaultColumns = [
  { key: "network", title: "Networks" },
  { key: "followers", title: "Followers" },
  { key: "date", title: "Req. date" },
  { key: "content", title: "Content" },
  { key: "description", title: "Post description" },
  { key: "tag", title: "Story tag" },
  { key: "link", title: "Story link" },
  { key: "brief", title: "Additional brief" },
];

export const defaultData = [
  {
    network: "Dance music BPM",
    followers: "12M",
    date: "ASAP",
    content: "VIDEO",
    description: "Post description",
    tag: "@kolschofficia",
    link: "https://ffm.to/joan",
    brief: "special requests",
  },
];

export const categoryColumns = [
  { key: "network", title: "Networks" },
  { key: "followers", title: "Followers" },
  { key: "genres", title: "Genres" },
  { key: "countries", title: "Top 5 countries" },
  { key: "content", title: "Content" },
  { key: "description", title: "Post description" },
];

export const categoryData = [
  {
    network: "Techno TV",
    followers: "1.1M",
    genres: (
      <ul>
        <li>Techno (All)</li>
        <li>Techno (All)</li>
        <li>Techno (All)</li>
        <li>Techno (All)</li>
        <li>Techno (All)</li>
      </ul>
    ),
    countries: (
      <ul>
        <li>DE 16.5%</li>
        <li>UK 8%</li>
        <li>FR 16.5%</li>
        <li>ES 8%</li>
        <li>IT 16.5%</li>
      </ul>
    ),
    content: "VIDEO",
    description: "Post description",
  },
];
