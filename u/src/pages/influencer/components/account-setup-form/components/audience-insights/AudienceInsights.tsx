import './_audience-insights.scss';
import { PercentageInput } from '../percentage-input/PercentageInput';
import { AUDIENCE_INSIGHTS_INPUTS } from './data/audience-insights-inputs.data';
import {
  CountryArrayField,
} from "@/pages/influencer/components/account-setup-form/components/country-array-field/CountryArrayField.tsx";
import { useController, useFormContext, useWatch } from "react-hook-form";
import type {
  TSocialAccountFormValues
} from "@/pages/influencer/components/account-setup-form/types/account-setup.types.ts";
import { useEffect } from "react";

export const AudienceInsights = () => {
  const { control, clearErrors } = useFormContext<TSocialAccountFormValues>();
  const { fieldState } = useController({
    control,
    name: "countries",
  })

  const countries = useWatch({
    control,
    name: "countries",
  });

  useEffect(() => {
    if (fieldState.error) {
      clearErrors("countries");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countries]);

  const errorMessage = fieldState.error?.root?.message || fieldState.error?.message;
  // console.log('Error message in AudienceInsights: ', errorMessage);

  return (
    <div className="audience-insights">
      <div className="audience-insights__header">
        <span className={`audience-insights__title ${errorMessage ? 'audience-insights__title--error' : ''}`}>
          {'Audience insights'}
          {errorMessage && <p className={`audience-insights__error`}>{errorMessage}</p>}
        </span>
        <p className="audience-insights__subtitle">Enter the top 5 audience countries and their reach percentage</p>
      </div>

      <ul className="audience-insights__list">
        {AUDIENCE_INSIGHTS_INPUTS.map((inputSet, index) => (
          <li key={index} className="audience-insights__item">
            <span className="audience-insights__item-label">#{index + 1}</span>
            <div className="audience-insights__inputs">
              <PercentageInput
                placeholder={inputSet.percentageInput.placeholder}
                index={index}
              />
              <CountryArrayField
                index={index}
                placeholder={inputSet.countryInput.placeholder}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};