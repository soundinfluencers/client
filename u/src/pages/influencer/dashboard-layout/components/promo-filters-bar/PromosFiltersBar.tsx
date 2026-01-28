import { useMatch, useNavigate } from 'react-router-dom';
import { useDashboardLayoutStore } from '../../store/useDashboardLayoutStore';
import { FILTER_OPTIONS } from './data/promo-filters-bar.data';

import './_promos-filters-bar.scss';

export const PromosFiltersBar = () => {
  const isHistory = useMatch("/dashboard/campaign-history");

  const {
    activePromosFilter,
    setActivePromosFilter,
    activeCampaignHistoryFilter,
    setActiveCampaignHistoryFilter,
  } = useDashboardLayoutStore();

  const navigate = useNavigate();

  const handleReviewAll = (status: string) => {
    switch (status) {
      case 'pending':
        navigate('/influencer/promos/new-promos');
        break;
      case 'distributing':
        navigate('/influencer/promos/distributing');
        break;
      case 'completed':
        navigate('/influencer/promos/completed');
        break;
      default:
        navigate('/influencer/promos');
    }
  };

  const activeFilters = isHistory ? activeCampaignHistoryFilter : activePromosFilter;
  const setActiveFilters = isHistory ? setActiveCampaignHistoryFilter : setActivePromosFilter;

  return (
    <ul className="promos-filters-bar">
      {FILTER_OPTIONS.map(option => (
        <li
          key={option.value}
          className='promos-filters-bar__item'
        >
          <div className='promos-filters-bar__item-label-wrapper'>
            <p
              className={`promos-filters-bar__item-label ${activeFilters === option.value ? 'promos-filters-bar__item-label--active' : ''}`}
              onClick={() => {
                if (activeFilters === option.value) {
                  setActiveFilters('all');
                } else {
                  setActiveFilters(option.value);
                }
              }}
            >
              {option.label}
            </p>
            <span className={`promos-filters-bar__item-indicator ${activeFilters === option.value ? 'promos-filters-bar__item-indicator--active' : ''}`} />
          </div>
          <button
            className='promos-filters-bar__item-button'
            onClick={() => handleReviewAll(option.value)}
          >
            Review all
          </button>
        </li>
      ))}
    </ul>
  );
}