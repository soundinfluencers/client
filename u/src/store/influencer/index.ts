// import { create } from "zustand";
// import { getInfluencer } from "../../api/influencer/get-influencer/get-influencer.api";

// interface IInfluencerStore {
//   influencer: any | null;
//   setInfluencer: (accessToken: string, id: string) => void;
// }

// export const useInfluencerStore = create<IInfluencerStore>((set) => ({
//   influencer: null,
//   setInfluencer: async (accessToken: string, id: string) => {
//     const data = await getInfluencer(accessToken, id);
//     console.log(data, "influencer data");
//     set({ influencer: data.influencer });
//   },
// }));


