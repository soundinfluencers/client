import './_campaign-result-form.scss';
import { Form } from '../../../../../../components';
import { ButtonMain } from '../../../../../../components/ui/buttons-fix/ButtonFix';
import { FormFields } from '../../../../../../components/form/render-fields/FormFields';
import type { TSocialMedia } from '../../../../../../types/influencer/form/campaign-result/campaign-result.types';
import { CAMPAIGN_RESULT_INPUTS_DATA } from '../../../../../../constants/influencer/form-data/campaign-result/campaign-result.data';

interface Props {
  meta: TSocialMedia;
  onFormClose?: () => void;
}

//TODO: REVIEW AND FIX THE FUNCTIONALITY AS NEEDED

export const CampaignResultForm = ({ meta, onFormClose }: Props) => {
  // const url = `https://api.cloudinary.com/v1_1/dt57ht1bi/upload`;

  // const handleSubmit = async (data: any) => {
  //   const file = data.screenshotsInsights;

  //   if (file) {
  //     const formData = new FormData();
  //     formData.append('file', file);
  //     formData.append('upload_preset', 'ml_default'); // replace with your upload preset

  //     try {
  //       const response = await fetch(url, {
  //         method: 'POST',
  //         body: formData,
  //       });

  //       const result = await response.json();
  //       console.log('Upload successful:', result.secure_url);
  //     } catch (error) {
  //       console.error('Error uploading file:', error);
  //     }
  //   }
  // };

  return (
    <div className="campaign-result">
      <h2 className="campaign-result__title">Campaign result</h2>
      <button onClick={() => onFormClose?.()}>Close</button>
      <Form
        submitButton={<ButtonMain type="submit" label='Submit' />}
        onSubmit={() => {}}
        className='campaign-result__form'
      >
        <FormFields inputs={CAMPAIGN_RESULT_INPUTS_DATA[meta].inputs} />
      </Form>
    </div>
  );
};