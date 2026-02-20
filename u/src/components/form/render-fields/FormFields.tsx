import './_form-fields.scss';

import { Controller, useFormContext } from 'react-hook-form';
import { BaseInput } from '@/components';
import { ImageUpload } from '@/components';
import { StarRatingField } from '@/components';

// import type { TCampaignResultInput } from '../../../types/influencer/form/campaign-result/campaign-result.types';
// import type { TInvoiceInputConfig } from '../../../pages/influencer/create-invoice/components/invoice-form-content/types/invoice-form-inputs.types';
// import {Fragment} from 'react/jsx-runtime';
import { InfluencerDateInput } from '../../ui/influencer-date-input/InfluencerDateInput';
import { CountryField } from "@/pages/influencer/shared/components/CountryField.tsx";

interface Props {
  inputs: any;
}

export const FormFields = ({ inputs }: Props) => {
  const { control } = useFormContext();

  return (
    <div className="form-fields">
      {inputs.map((input) => {
        switch (input.type) {
          case 'text':
          case 'number':
          case 'numeric':
          case 'email':
          case 'password':
            return (
              <BaseInput
                key={input.name}
                name={input.name}
                label={input.label}
                placeholder={input.placeholder}
                type={input.type}
              />

            );
          case 'file':
            return (
              <ImageUpload
                key={input.name}
                name={input.name}
                label={input.label}
                placeholder={input.placeholder}
                description={input.description}
                size={input.size}
                // value={field.value}
                // onChange={field.onChange}
                // error={fieldState.error}
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
                    error={fieldState.error}
                  />
                )}
              />
            );
          case 'date':
            return (
              <InfluencerDateInput
                key={input.name}
                name={input.name}
                label={input.label}
                placeholder={input.placeholder}
              />
            );
          case 'country':
            return (
              <CountryField
                key={input.name}
                name={input.name}
                label={input.label}
                placeholder={input.placeholder}
              />
            );
          default:
            return null;
        }
      })}
    </div>
  );
}

// <Fragment key={input.name}>
//   <BaseInput
//     name={input.name}
//     label={input.label}
//     placeholder={input.placeholder}
//     type={input.type}
//   />
//
//   {input.description && (
//     <p className='description'>
//       {input.description}
//     </p>
//   )}
// </Fragment>

// case 'file':
//   return (
//     <Controller
//       key={input.name}
//       control={control}
//       name={input.name}
//       render={({field, fieldState}) => (
//         <ImageUpload
//           name={input.name}
//           label={input.label}
//           placeholder={input.placeholder}
//           description={input.description}
//           size={input.size}
//           // value={field.value}
//           // onChange={field.onChange}
//           // error={fieldState.error}
//         />
//       )}
//     />
//   );