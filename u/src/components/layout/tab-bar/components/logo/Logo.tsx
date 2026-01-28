import type {FC} from "react";
// import logo from '@/assets/logos/logo.svg';
import logoMain from '@/assets/logos/logo-main.svg';
import './_logo.scss';

export interface LogoProps {
    onClick?: () => void;
}

export const Logo: FC<LogoProps> = ({onClick}: LogoProps) => {
    const handleClick = () => {
        if (onClick) onClick();
    }

    return (
      <div className="logo" onClick={handleClick}>
          <img src={logoMain} alt=""/>
          <p>SoundInfluencers</p>
      </div>
    );
}