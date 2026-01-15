import React, { useState } from 'react';
import './_star-rating-field.scss';

interface Props {
  label: string;
  max?: number;

  value: number;
  onChange: (value: number) => void;
};

export const StarRatingField: React.FC<Props> = ({
  label,
  max = 5,
  value,
  onChange,
}) => {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const activeValue = hoverValue ?? value;

  // const activeValue = hoverValue
  //   ? Math.max(value, hoverValue)
  //   : value;

  return (
    <div className="star-rating-field">
      <label className='star-rating-field__label'>{label}</label>

      <div className='star-rating-field__stars' onMouseLeave={() => setHoverValue(null)}>
        {Array.from({ length: max }, (_, index) => {
          const starValue = index + 1;
          const isActiveValue = starValue <= activeValue;

          return (
            <button
              key={starValue}
              type='button'
              className={`star-rating-field__star ${isActiveValue ? 'star-rating-field__star--filled' : ''}`}
              onClick={() => onChange(starValue)}
              onMouseEnter={() => setHoverValue(starValue)}
            >
              <svg
                viewBox="0 0 32 32"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M16.0013 2.66602L20.1213 11.0127L29.3346 12.3593L22.668 18.8527L24.2413 28.026L16.0013 23.6927L7.7613 28.026L9.33464 18.8527L2.66797 12.3593L11.8813 11.0127L16.0013 2.66602Z"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          );
        })}
      </div>
    </div>
  );
};