import type {FC} from "react";
import './_home-page.scss';
import {HomeHeader} from "./components/layout/header/HomeHeader.tsx";

export const HomePage: FC = () => {
    return (
        <div className='home-page'>
            <HomeHeader/>
        </div>
    )
}