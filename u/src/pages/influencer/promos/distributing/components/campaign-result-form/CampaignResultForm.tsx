import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form } from '@/components';
import { ButtonMain } from '@components/ui/buttons-fix/ButtonFix.tsx';
import { FormFields } from '@components/form/render-fields/FormFields.tsx';
import { CAMPAIGN_RESULT_INPUTS_DATA } from './data/campaign-result-form-inputs.data';
import type { SubmitResultsNavState } from './utils/distributing-nav.helper';
import { usePromoCompletion } from './model/use-promo-completion';
import { createPromoScreenshot } from './model/promo-screenshot';
import { type CampaignResultDataValues, getCampaignResultDataSchema } from './validation/campaignResult.schema';
import './_campaign-result-form.scss';

export const CampaignResultForm = ({ submitState }: { submitState: SubmitResultsNavState }) => {
  const navigate = useNavigate();
  const success = () => navigate({ pathname: '/influencer/promos/distributing', search: '', hash: '' }, { replace: true, state: null });
  const operation = usePromoCompletion(submitState, success);
  const uploadBusy = useRef(false);
  const [uploadPending, setUploadPending] = useState(false);
  const schema = useMemo(() => getCampaignResultDataSchema(submitState.meta), [submitState.meta]);
  const lockedInputs = operation.isPending || operation.completed;
  return <div className="campaign-result">
    <h2 className="campaign-result__title">Campaign result</h2>
    <Form<CampaignResultDataValues>
      onSubmit={values => { if (!uploadBusy.current) return operation.submit(values); }}
      className="campaign-result__form" schema={schema} validateMode="all">
      <FormFields inputs={CAMPAIGN_RESULT_INPUTS_DATA[submitState.meta].inputs} inert={!!lockedInputs} imageUploadOptions={{
        contextKey: `${operation.owner.epoch}:${submitState.campaignId}:${submitState.addedAccountsId}:${operation.scope}`,
        isCurrent: () => operation.live() && !lockedInputs,
        createController: createPromoScreenshot,
        accept: 'image/jpeg,image/png,image/webp',
        onPendingChange: pending => { uploadBusy.current = pending; setUploadPending(pending); },
      }} />
      <div className="campaign-result__form-submit">
        <ButtonMain type="submit" label={operation.isPending ? 'Submitting...' : 'Submit'} isDisabled={lockedInputs || uploadPending || !operation.owner.active} />
      </div>
    </Form>
  </div>;
};
