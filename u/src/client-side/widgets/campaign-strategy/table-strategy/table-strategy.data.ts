// import type { DropdownKey, TableView } from "./table-strategy";

// export const proposalsData = [
//   {
//     network: "Dance music BPM",
//     followers: "12M",
//     genres: ["Techno (All)", "Bass", "EDM", "Psy", "Techno (All)"],
//     countries: ["DE 16.5%", "UK 8%", "FR 16.5%", "ES 8%", "IT 16.5%"],
//   },
//   {
//     network: "Techno TV",
//     followers: "112M",
//     genres: ["Techno (All)", "Bass", "EDM", "Psy", "Techno (All)"],
//     countries: ["DE 16.5%", "UK 8%", "FR 16.5%", "ES 8%", "IT 16.5%"],
//   },
// ];

// export const keys = (view: TableView) => {
//   switch (view) {
//     case "main":
//       return [
//         "network",
//         "followers",
//         "date",
//         "content",
//         "description",
//         "tag",
//         "link",
//         "brief",
//       ];

//     case "music":
//       return [
//         "network",
//         "followers",
//         "date",
//         "content",
//         "description",
//         "brief",
//       ];

//     case "press":
//       return [
//         "network",
//         "followers",
//         "date",
//         "content",
//         "description",
//         "brief",
//       ];

//     default:
//       return [];
//   }
// };

// export const keyMap: Record<string, string> = {
//   tag: "artworkLinks",
//   link: "musicLinks",
//   tracklink: "spotifyTrackLink",
//   tracktitle: "trackTitle",
//   brief: "additionalBrief",
// };

// export const titles: Record<string, string> = {
//   network: "Networks",
//   followers: "Followers",
//   genres: "Genres",
//   countries: "Top 5 countries",
//   date: "Req. date",
//   content: "Content",
//   description: "Post description",
//   tag: "Story tag",
//   link: "Story link",
//   tracklink: "Track link",
//   tracktitle: "Track Title",
//   brief: "Additional brief",
// };

// export const ReqData = ["ASAP", "BEFORE", "AFTER"];

// export const getDropdownOptions = (key: DropdownKey): string[] => {
//   switch (key) {
//     case "date":
//       return ReqData;
//     default:
//       return [];
//   }
// };
