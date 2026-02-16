import './_promos-details-list-card.scss';
import copy from '../../../../../../assets/icons/copy.svg';
import checkCircle from '../../../../../../assets/icons/check-circle.svg';
import React, { useEffect, useRef, useState } from 'react';

interface Props {
  label: string;
  value: string;
  copyable?: boolean;
  linkable?: boolean;
}

export const DetailsRow: React.FC<Props> = ({ label, value, copyable, linkable }) => {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  const handleCopy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(value);

      setCopied(true);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = window.setTimeout(() => {
        setCopied(false);
      }, 300);

    } catch (err) {
      //set some error in toast notification
      console.error('Copy failed', err);
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="promos-details-list-card__body-details-item">
      <p className="promos-details-list-card__body-details-item-name">{label}</p>
      {copyable ? (
        <div className="promos-details-list-card__body-details-item-wrapper">
          <p className="promos-details-list-card__body-details-item-description">{value}</p>
          <button
            className={`promos-details-list-card__body-details-item-copy ${copied ? 'promos-details-list-card__body-details-item-copy--copied' : ''}`}
            onClick={handleCopy}
            aria-label="Copy to clipboard"
            title="Copy"
          >
            <img src={copied ? checkCircle : copy} alt="copy-icon"/>
          </button>
        </div>
      ) : linkable ? (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="promos-details-list-card__body-details-item-description promos-details-list-card__body-details-item-description--link"
        >
          {value}
        </a>
      ) : (
        <p className="promos-details-list-card__body-details-item-description">{value}</p>
      )}
    </div>
  );
};