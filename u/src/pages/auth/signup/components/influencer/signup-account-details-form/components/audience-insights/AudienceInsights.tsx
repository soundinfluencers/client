import type { UseFormRegister, UseFormSetValue } from 'react-hook-form';
import './_audience-insights.scss';
import type { IAccountFormValues } from '../../../../../../../../types/user/influencer.types';
import { CountryInput } from '../../../../ui/country-input/CountryInput';

interface AudienceInsightsInput {
  name: string;
  placeholder: string;
}

interface AudienceInsightsInputs {
  percentageInput: AudienceInsightsInput;
  countryInput: AudienceInsightsInput;
}

const AUDIENCE_INSIGHTS_INPUTS: AudienceInsightsInputs[] = [
  {
    percentageInput: {
      name: "percentage",
      placeholder: "19.4%",
    },
    countryInput: {
      name: "country",
      placeholder: "Find country",
    },
  },
  {
    percentageInput: {
      name: "percentage",
      placeholder: "9.4%",
    },
    countryInput: {
      name: "country",
      placeholder: "Find country",
    },
  },
  {
    percentageInput: {
      name: "percentage",
      placeholder: "4.4%",
    },
    countryInput: {
      name: "country",
      placeholder: "Find country",
    },
  },
  {
    percentageInput: {
      name: "percentage",
      placeholder: "3.4%",
    },
    countryInput: {
      name: "country",
      placeholder: "Find country",
    },
  },
  {
    percentageInput: {
      name: "percentage",
      placeholder: "1.4%",
    },
    countryInput: {
      name: "country",
      placeholder: "Find country",
    },
  },
];

interface Props {
  register: UseFormRegister<IAccountFormValues>;
  setValue?: UseFormSetValue<IAccountFormValues>;
};

export const AudienceInsights: React.FC<Props> = ({ register, setValue }) => {
  return (
    <div className="audience-insights">
      <div className="audience-insights__header">
        <p className="audience-insights__title">Audience insights</p>
        <p className="audience-insights__subtitle">Enter the top 5 audience countries and their reach percentage</p>
      </div>

      <ul className="audience-insights__list">
        {AUDIENCE_INSIGHTS_INPUTS.map((inputSet, index) => (
          <li key={index} className="audience-insights__item">
            <span className="audience-insights__item-label">#{index + 1}</span>
            <div className="audience-insights__inputs">
              <input
                type="numeric"
                placeholder={`${inputSet.percentageInput.placeholder}`}
                className='percentage-input'
                {...register(`countries.${index}.percentage`, {
                  setValueAs: (value: string) => {
                    if (!value) return null;
                    return Number(value.replace('%', ''));
                  },
                  onChange: (e) => {
                    const val = e.target.value.replace('%', '');
                    if (!/^\d*\.?\d*$/.test(val)) return;
                    e.target.value = val ? `${val}%` : '';
                  }
                })}
              />
              <CountryInput
                placeholder={inputSet.countryInput.placeholder}
                register={register}
                setValue={setValue}
                index={index}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
