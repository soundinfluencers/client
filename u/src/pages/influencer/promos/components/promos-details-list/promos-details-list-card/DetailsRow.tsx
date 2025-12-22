import './_promos-details-list-card.scss';
import copy from '../../../../../../assets/icons/copy.svg';

interface Props {
  label: string;
  value: string;
  copyble?: boolean;
}

export const DetailsRow: React.FC<Props> = ({ label, value, copyble }) => {
  const handleCopy = async (copyValue: string) => {
    await navigator.clipboard.writeText(copyValue);
    
    alert(`Copied to clipboard: ${copyValue}`);

    // if need to show some notification or change image on copy button
    // setIsCopied(true);
    // setTimeout(() => setIsCopied(false), 2000);
  }

  return (
    <div className='promos-details-list-card__body-details-item'>
      <p className='promos-details-list-card__body-details-item-name'>{label}</p>
      {copyble ? (
        <div className='promos-details-list-card__body-details-item-wrapper'>
          <p className='promos-details-list-card__body-details-item-description'>{value}</p>
          <button
            className='promos-details-list-card__body-details-item-copy'
            onClick={() => handleCopy(value)}
          >
            <img src={copy} alt="copy" />
          </button>
        </div>
      ) : (
        <p className='promos-details-list-card__body-details-item-description'>{value}</p>
      )}
    </div>
  );
};