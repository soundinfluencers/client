import type {
  SocialAccountDraft,
  TSocialAccounts,
} from "@/types/user/influencer.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { qk } from "./query-keys";
import {
  normalizeAccountForForm,
} from "../../shared/utils/socialAccount.mapper";
import {
  createSocialAccount,
  deleteSocialAccount,
  getSocialAccountById,
  updateSocialAccount,
} from "@/api/influencer/profile/influencer-profile.api";

export const useSocialAccountQuery = (
  platform: TSocialAccounts | undefined,
  accountId: string | undefined,
  enabled = true,
) => {
  return useQuery({
    queryKey: platform && accountId ? qk.socialAccounts(platform, accountId) : ["social-account-disabled"],
    enabled: enabled && !!accountId && !!platform,
    queryFn: async () => {
      const data = await getSocialAccountById(platform!, accountId!);
      return normalizeAccountForForm(data);
    },
  });
};

export const useCreateSocialAccountMutation = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      platform,
      payload,
    }: {
      platform: TSocialAccounts;
      payload: SocialAccountDraft;
    }) => {
      return createSocialAccount(payload, platform);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.influencerProfile });
    },
  });
};

export const useUpdateSocialAccountMutation = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      platform,
      accountId,
      payload,
    }: {
      platform: TSocialAccounts;
      accountId: string;
      payload: SocialAccountDraft;
    }) => {
      return updateSocialAccount(
        payload,
        accountId,
        platform,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.influencerProfile });
    },
  });
};

export const useDeleteSocialAccountMutation = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: deleteSocialAccount,
    onSuccess: () => {
      console.log('invalidate call')
      qc.invalidateQueries({ queryKey: qk.influencerProfile });
    },
  });
};
