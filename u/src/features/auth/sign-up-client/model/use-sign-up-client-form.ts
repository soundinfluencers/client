import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSignUpClientMutation } from "@/features/auth/sign-up-client/model/use-sign-up-client-mutation.ts";
import { useSignUpClientDraftStore } from "@/features/auth/sign-up-client/model/sign-up-client.store.ts";
import {
  getInitialPersonalDetails,
  mapSignupClientToDto,
} from "@/features/auth/sign-up-client/model/sign-up-client.mappers.ts";
import {
  signUpClientFormSchema,
  type TSignUpClientFormValues,
} from "@/features/auth/sign-up-client/model/sign-up-client-form.schema.ts";

interface UseSignUpClientFormParams {
  defaultFormValues: TSignUpClientFormValues;
}

export const useSignUpClientForm = ({
  defaultFormValues,
}: UseSignUpClientFormParams) => {
  const { mutate, isPending } = useSignUpClientMutation();
  const resetDraft = useSignUpClientDraftStore((state) => state.resetDraft);
  const methods = useForm<TSignUpClientFormValues>({
    resolver: zodResolver(signUpClientFormSchema),
    defaultValues: {
      ...getInitialPersonalDetails(),
      ...defaultFormValues,
      password: '', // always reset password field for security reasons
    },
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const onSubmit = async (data: TSignUpClientFormValues) => {
    console.log("Form submitted with data:", data);

    mutate(mapSignupClientToDto(data), {
      onSuccess: () => {
        resetDraft();
        methods.reset({
          ...getInitialPersonalDetails(),
          password: '', // always reset password field for security reasons
        });
        setIsModalOpen(true);
      },
    });

    console.log("Successfully submitted with data:", data);
  };

  return {
    methods,
    onSubmit,
    isPending: isPending,
    isModalOpen,
    setIsModalOpen,
  }
};
