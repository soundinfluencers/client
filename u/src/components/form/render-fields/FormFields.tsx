import './_form-fields.scss';

import { Controller, useFormContext } from 'react-hook-form';
import { BaseInput } from '../../ui/inputs/base-input/BaseInput';
import { ImageUpload } from '../../ui/image-upload/ImageUpload';
import { StarRatingField } from '../../ui/star-rating/StarRatingField';

// import type { TCampaignResultInput } from '../../../types/influencer/form/campaign-result/campaign-result.types';
// import type { TInvoiceInputConfig } from '../../../pages/influencer/create-invoice/components/invoice-form-content/types/invoice-form-inputs.types';
import { Fragment } from 'react/jsx-runtime';

interface Props {
  inputs: any;
};

export const FormFields = ({ inputs }: Props) => {
  const { control } = useFormContext();

  return (
    <div className="form-fields">
      {inputs.map((input) => {
        switch (input.type) {
          case 'text':
          case 'number':
          case 'email':
          case 'password':
            return (
              <Fragment key={input.name}>
                <BaseInput
                  name={input.name}
                  label={input.label}
                  placeholder={input.placeholder}
                  type={input.type}
                />

                {input.description && (
                  <p className='description'>
                    {input.description}
                  </p>
                )}
              </Fragment>
            );
          case 'file':
            return (
              <Controller
                key={input.name}
                control={control}
                name={input.name}
                render={({ field, fieldState }) => (
                  <ImageUpload
                    name={input.name}
                    label={input.label}
                    placeholder={input.placeholder}
                    description={input.description}
                    value={field.value}
                    onChange={field.onChange}
                    size={input.size}
                    error={fieldState.error}
                  />
                )}
              />
            );
          case 'rating':
            return (
              <Controller
                key={input.name}
                control={control}
                name={input.name}
                render={({ field, fieldState }) => (
                  <StarRatingField
                    label={input.label}
                    value={field.value}
                    max={input.maxRating}
                    onChange={field.onChange}
                  />
                )}
              />
            );
          default:
            return null;
        };
      })}
    </div>
  );
}