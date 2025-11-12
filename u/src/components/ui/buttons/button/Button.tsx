import type {FC} from "react";
import './_button.scss';

export interface ButtonProps {
    text: string;
    onClick: () => void;
    isDisabled?: boolean;
}

const handleClick = (isDisabled: boolean, onClick: () => void) => {
    if (!isDisabled) onClick();
}

export const ButtonMain: FC<ButtonProps> = ({ text, onClick, isDisabled = false } : ButtonProps) => {
    return (
        <div className={`button-main ${isDisabled ? 'disabled' : ''}`} onClick={() => handleClick(isDisabled, onClick)}>
            <p>{text}</p>
        </div>
    )
}

export const ButtonSecondary: FC<ButtonProps> = ({ text, onClick, isDisabled = false } : ButtonProps) => {
    return (
        <div className={`button-secondary`} onClick={() => handleClick(isDisabled, onClick)}>
            <p>{text}</p>
        </div>
    )
}

