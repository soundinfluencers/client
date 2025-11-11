import type {FC} from "react";
import logo from '@/assets/logos/logo.svg';
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
          <img src={logo} alt=""/>
          <p>SoundInfluencers</p>
      </div>
    );
}