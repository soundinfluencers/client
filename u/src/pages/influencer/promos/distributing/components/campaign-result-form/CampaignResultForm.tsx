import { useEffect } from 'react';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from 'react-router-dom';
import { Form } from '@/components';
import { ButtonMain } from '@components/ui/buttons-fix/ButtonFix.tsx';
import { FormFields } from '@components/form/render-fields/FormFields.tsx';

import { CAMPAIGN_RESULT_INPUTS_DATA } from './data/campaign-result-form-inputs.data';
import { getCampaignResultSchema } from './validation/campaignResult.schema';
import { createInfluencerPromoReview } from '@/api/influencer/promos/influencer-promos.api';
import { campaignResultMapper } from './utils/campaign-result-form.mapper';
import { handleApiError } from '@/api/error.api';
import { toast } from "react-toastify";
import type { SubmitResultsNavState } from './utils/distributing-nav.helper';
// import type { ICampaignResultFormData } from './types/campaign-result-form.types';

import './_campaign-result-form.scss';
import { useUser } from '@/store/get-user';
import { useAuth } from '@/contexts/AuthContext';

interface Props {
  submitState: SubmitResultsNavState;
}

export const CampaignResultForm = ({ submitState }: Props) => {
  const { user, setUser } = useUser();
  const { accessToken} = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: createInfluencerPromoReview,

    onSuccess: async (balance) => {
      if (user) {
        setUser({ ...user, accessToken: accessToken ?? null, balance });
      }
      toast.success("Campaign result submitted successfully!");

      await queryClient.invalidateQueries({ queryKey: ["distributingOrCompleted-promos"] });

      await queryClient.refetchQueries({ queryKey: ["influencer-profile"], type: 'active' });

      navigate(
        { pathname: '/influencer/promos/distributing', hash: '' },
        { replace: true, state: submitState.from ?? null },
      );
    },

    onError: (error) => {
      handleApiError(error);
    },
  });

  return (
    <div className="campaign-result">
      <h2 className="campaign-result__title">Campaign result</h2>
      <Form
        onSubmit={(data) => mutate(campaignResultMapper(submitState, data))}
        className='campaign-result__form'
        schema={getCampaignResultSchema(submitState.meta) as any}
      >
        <FormFields inputs={CAMPAIGN_RESULT_INPUTS_DATA[submitState.meta].inputs} />

        <div className="campaign-result__form-submit">
          <ButtonMain
            type="submit"
            label={isPending ? 'Submitting...' : 'Submit'}
            isDisabled={isPending}
          />
        </div>
      </Form>
    </div>
  );
};