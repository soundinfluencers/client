import './_audience-insights.scss';
import { CountryInput } from '../country-input/CountryInput';
import { PercentageInput } from '../percentage-input/PercentageInput';
import { AUDIENCE_INSIGHTS_INPUTS } from './data/audience-insights-inputs.data';

export const AudienceInsights = () => {
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
              <PercentageInput
                placeholder={inputSet.percentageInput.placeholder}
                index={index}
              />
              <CountryInput
                placeholder={inputSet.countryInput.placeholder}
                index={index}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};