import type { FC } from "react";
import logoMain from '@/assets/logos/logo-main.svg';
import logoText from '@/assets/icons/logo-text.svg';
import './_logo.scss';

export interface LogoProps {
  onClick?: () => void;
}

export const Logo: FC<LogoProps> = ({ onClick }: LogoProps) => {
  const handleClick = () => {
    if (onClick) onClick();
  }

  return (
    <div className="logo" onClick={handleClick}>
      <img src={logoMain} alt="" />
      <img src={logoText} alt="" style={{width: 128, height: 11}}/>
    </div>
  );
}