import React from "react";

import s from './circle-loader.module.scss';

interface CircleLoaderProps {
  size?: number;
  color?: string;
  duration?: number;
}

export const CircleLoader: React.FC<CircleLoaderProps> = ({
  size = 18,
  color = 'currentColor',
  duration = 1,
}) => {
  return (
    <span
      className={s.loader}
      style={{
        width: size,
        height: size,
        borderColor: `${color} transparent`,
        '--loader-duration': `${duration}s`,
      } as React.CSSProperties}
    />
  );
};
