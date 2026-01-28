import { useState } from 'react';
import { Form } from '../../../../../../components';
import { ButtonMain } from '../../../../../../components/ui/buttons-fix/ButtonFix';
import { FormFields } from '../../../../../../components/form/render-fields/FormFields';

import type { ICampaignResultFormData } from './types/campaign-result-form.types';
import { CAMPAIGN_RESULT_INPUTS_DATA } from './data/campaign-result-form-inputs.data';
import { getCampaignResultSchema } from './validation/campaignResult.schema';
import { createInfluencerPromoReview } from '@/api/influencer/promos/influencer-promos.api';
import { campaignResultMapper } from './utils/campaign-result-form.mapper';
import { handleApiError } from '@/api/error.api';
import { toast } from "react-toastify";
import type { SubmitResultsNavState } from './utils/distributing-nav.helper';
import './_campaign-result-form.scss';

interface Props {
  submitState: SubmitResultsNavState;
  // meta: TSocialMedia;
  // formPayload: TCampaignInfo;
  // onFormClose: () => void;
}

// TODO: REVIEW AND FIX THE FUNCTIONALITY AS NEEDED
export const CampaignResultForm = ({ submitState }: Props) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: ICampaignResultFormData) => {
    console.log('Form submitted with data:', data);
    setIsLoading(true);
    try {
      const dto = campaignResultMapper(submitState, data);
      console.log('Data after mapping to api:', dto);
      await createInfluencerPromoReview(dto);
      console.log('Form data processed successfully:', dto);
      // open success modal or show success toast message
      toast.success("Campaign result submitted successfully!");
      // onFormClose();
    } catch (error) {
      handleApiError(error);
    } finally {
      // Any cleanup actions if necessary
      setIsLoading(false);
    }
  };

  return (
    <div className="campaign-result">
      <h2 className="campaign-result__title">Campaign result</h2>
      {/* <button onClick={() => { onFormClose() }}>Close</button> */}
      <Form
        onSubmit={handleSubmit}
        className='campaign-result__form'
        schema={getCampaignResultSchema(submitState.meta) as any}
      >
        <FormFields inputs={CAMPAIGN_RESULT_INPUTS_DATA[submitState.meta].inputs} />

        <div className="campaign-result__form-submit">
          <ButtonMain
            type="submit"
            label={isLoading ? 'Submitting...' : 'Submit'}
            isDisabled={isLoading}
          />
        </div>
      </Form>
    </div>
  );
};