import './_campaign-result-form.scss';
import { useForm } from 'react-hook-form';
import { CAMPAIGN_RESULT_FIELDS, normalizeSocialMedia, PLATFORM_LABELS, type CampaignFieldConfig } from './types';
import type { SocialMediaType } from '../../../../../types/utils/constants.types';

export interface CampaignResultFormValues {
  link: string;
  postDate: string;
  screenshot: FileList | null;
  impressions: number | '';
  likes: number | '';
  comments: number | '';
  shares: number | '';
}


interface Props {
  meta: SocialMediaType;
  onFormClose?: () => void;
}

export const CampaignResultForm = ({ meta, onFormClose }: Props) => {
  const platform = normalizeSocialMedia(meta);
  const fieldConfigs = CAMPAIGN_RESULT_FIELDS[platform];
  const platformLabel = PLATFORM_LABELS[platform];

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<CampaignResultFormValues>({
    // defaultValues: {
    //   link: '',
    //   postDate: '',
    //   screenshot: null,
    //   impressions: '',
    //   likes: '',
    //   comments: '',
    //   shares: '',
    // },
    mode: 'onChange'
  });

  const onSubmit = (data: CampaignResultFormValues) => {
    console.log('Campaign result submit:', {
      platform: meta,
      ...data,
    });
  };

  const renderField = (field: CampaignFieldConfig) => {
    const commonProps = {
      className: 'campaign-result__input',
      placeholder: resolveText(field.placeholder, platformLabel),
      ...register(field.name, {
        required: field.required,
        valueAsNumber: field.type === 'number',
      }),
    };

    switch (field.type) {
      case 'text':
        return <input type="text" {...commonProps} />;

      case 'date':
        return <input type="date" {...commonProps} />;

      case 'number':
        return <input type="number" {...commonProps} />;

      case 'file':
        return <input type="file" accept="image/*" {...commonProps} />;

      default:
        return null;
    }
  };


  return (
    <div className="campaign-result">
      <button onClick={() => onFormClose?.()}>Close</button>

      <p className="campaign-result__title">Campaign result</p>

      <form
        className="campaign-result__form"
        onSubmit={handleSubmit(onSubmit)}
      >

        {fieldConfigs.map((field) => (
          <label key={field.name} className="campaign-result__label">
            {resolveText(field.label, platformLabel)}

            {renderField(field)}

            {field.hint && <p>{field.hint}</p>}
          </label>
        ))}


        <div className="campaign-result__actions">
          <button
            className="campaign-result__button-submit"
            type="submit"
            disabled={!isValid}
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

const resolveText = (
  value: string | ((platformLabel: string) => string) | undefined,
  platformLabel: string
): string | undefined => {
  if (!value) return undefined;
  return typeof value === 'function'
    ? value(platformLabel)
    : value;
};


// {/* LINK */ }
// <label className="campaign-result__label">
//   {meta} link
//   <input
//     className="campaign-result__input"
//     type="text"
//     placeholder={`Enter ${meta} link`}
//     {...register('link', { required: 'Link is required' })}
//   />
//   {errors.link && <p>{errors.link.message}</p>}
// </label>

// {/* DATE */ }
// <label className="campaign-result__label">
//   Date post
//   <input
//     className="campaign-result__input"
//     type="text"
//     placeholder="Enter date post dd/mm/yyyy"
//     {...register('postDate', { required: 'Post date is required' })}
//   />
//   {errors.postDate && <p>{errors.postDate.message}</p>}
// </label>

// {/* SCREENSHOT */ }
// <label className="campaign-result__label">
//   Screenshots insights
//   <input
//     className="campaign-result__input"
//     type="file"
//     accept="image/*"
//     {...register('screenshot', { required: 'Screenshot is required' })}
//   />
//   <p>
//     Please make sure to upload the screenshot at least 24 hours after
//     posting, allowing sufficient time for the content to reach its full
//     audience.
//   </p>
//   {errors.screenshot && <p>{errors.screenshot.message}</p>}
// </label>

// {/* METRICS */ }
//         <label className="campaign-result__label">
//           Impressions
//           <input
//             className="campaign-result__input"
//             type="number"
//             placeholder="Enter impressions"
//             {...register('impressions', { min: 0 })}
//           />
//         </label>

//         <label className="campaign-result__label">
//           Likes
//           <input
//             className="campaign-result__input"
//             type="number"
//             placeholder="Enter the likes number here"
//             {...register('likes', { min: 0 })}
//           />
//         </label>

//         <label className="campaign-result__label">
//           Comments
//           <input
//             className="campaign-result__input"
//             type="number"
//             placeholder="Enter the comments number here"
//             {...register('comments', { min: 0 })}
//           />
//         </label>

//         <label className="campaign-result__label">
//           Shares
//           <input
//             className="campaign-result__input"
//             type="number"
//             placeholder="Enter the shares number here"
//             {...register('shares', { min: 0 })}
//           />
//         </label>