import {type FC} from "react";
import './_switch-button.scss';

export interface SwitchButtonProps {
    firstTitle: string;
    secondTitle: string;
    activeIndex: number;
    onClick: () => void;
}

export const SwitchButton: FC<SwitchButtonProps> = ({firstTitle, secondTitle, activeIndex, onClick}: SwitchButtonProps) => {
    const sliderTransform = activeIndex === 0
        ? 'translateX(0px)'
        : 'translateX(313px)';

    return (
        <div className="switch-button">
            <div
                className="switch-button__slider"
                style={{ transform: sliderTransform }}
            />

            <div className={`switch-button__content ${activeIndex === 0 ? 'active' : ''}`} onClick={onClick}>
                <p>{firstTitle}</p>
            </div>
            <div className={`switch-button__content ${activeIndex === 1 ? 'active' : ''}`} onClick={onClick}>
                <p>{secondTitle}</p>
            </div>
        </div>
    );
}
