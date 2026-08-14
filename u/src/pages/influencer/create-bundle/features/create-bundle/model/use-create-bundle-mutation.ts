import { useMutation } from "@tanstack/react-query";
import { createBundleApi } from "@/pages/influencer/create-bundle/entities";
import { toast } from "react-toastify";

export const useCreateBundleMutation = () => {
  return useMutation({
    mutationFn: createBundleApi,
    onSuccess: () => {
      toast("Bundle successfully created.", {
        type: "success",
        position: "top-right",
        autoClose: 3000,
      });
    },
  });
};
