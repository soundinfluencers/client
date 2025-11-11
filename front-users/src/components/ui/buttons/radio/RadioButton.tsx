import React, { type FC, useState } from "react";
import "./_radio-button.scss";

export interface RadioButtonProps {
    content: string | React.ReactNode;
    size?: "sm" | "lg";
}

export const RadioButton: FC<RadioButtonProps> = ({ content, size = "sm" }) => {
    const [isChecked, setIsChecked] = useState<boolean>(false);

    const handleClick = () => {
        setIsChecked(!isChecked);
    };

    return (
        <div
            className={`radio-button radio-button--${size}`}
            onClick={handleClick}
        >
            <div
                className={`radio-button__circle radio-button__circle--${size}`}
            >
                <div
                    className={`radio-button__inner-circle ${
                        isChecked ? "radio-button__inner-circle--checked" : ""
                    }`}
                ></div>
            </div>

            {typeof content === "string" ? (
                <p className={`radio-button__title radio-button__title--${size}`}>
                    {content}
                </p>
            ) : (
                content
            )}
        </div>
    );
};
