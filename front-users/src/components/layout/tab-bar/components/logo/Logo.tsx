import type {FC} from "react";
import logo from '@/assets/logos/logo.svg';
import './_logo.scss';

export const Logo: FC = () => {
    return (
      <div className="logo">
          <img src={logo} alt=""/>
          <p>SoundInfluencers</p>
      </div>
    );
}