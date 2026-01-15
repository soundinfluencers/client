import { Link } from 'react-router-dom';
import clock from '../../../../../assets/icons/clock.svg';
import './_history-link.scss';

export const HistoryLink = () => {
  return (
    <Link
      className="history-link"
      to={"/dashboard/campaign-history"}
    >
      <span className='history-link__content'>
        <img src={clock} alt="Clock icon" />
        Campaign History
      </span>
    </Link>
  );
};

