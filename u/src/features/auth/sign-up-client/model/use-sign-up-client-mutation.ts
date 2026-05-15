import { useMutation } from "@tanstack/react-query";
import {createClientAccountApi} from "@/features/auth/sign-up-client/api/client-account.ts";


export const useSignUpClientMutation = () => {
  return useMutation({
    mutationFn: createClientAccountApi,
    onError: (error) => {
      console.log(error);
    },
  })
};
