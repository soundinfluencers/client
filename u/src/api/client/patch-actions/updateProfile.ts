import $api from "@/api/api";

type ProfileUpdate = {
  firstName: string;
  company: string;
  email: string;
  phone: string;
};

export const updateProfile = async (profile: ProfileUpdate) => {
  console.log(profile, "wawdwaaddwa");
  const response = await $api.patch("/profile/client/personal", profile);
  console.log(response, "a,la,awd,akd,ak");
  return response.data;
};
