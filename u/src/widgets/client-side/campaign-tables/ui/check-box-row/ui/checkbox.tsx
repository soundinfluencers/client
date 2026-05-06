import React from "react";
import checkIcon from "@/assets/icons/check (1).svg";
import styles from "./checkbox.module.scss";

type Props = {
    name: string;
    isChecked?: boolean;
    onChange?: (checked: boolean) => void;
    className?: string;
    disabled?: boolean;
};

export const Checkbox: React.FC<Props> = ({
                                              name,
                                              isChecked = false,
                                              onChange,
                                              className,
                                              disabled = false,
                                          }) => {
    const handleChange = React.useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            onChange?.(e.target.checked);
        },
        [onChange],
    );

    return (
        <label
            className={[
                styles.autoReplace,
                disabled ? styles.disabled : "",
                className ?? "",
            ]
                .filter(Boolean)
                .join(" ")}
        >
            <span className={styles.inputWrap}>
                <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={handleChange}
                    disabled={disabled}
                    className={styles.input}
                />
                <img
                    className={[
                        styles.icon,
                        isChecked ? styles.iconVisible : "",
                    ]
                        .filter(Boolean)
                        .join(" ")}
                    src={checkIcon}
                    alt=""
                    aria-hidden="true"
                />
            </span>

            <span className={styles.label}>{name}</span>
        </label>
    );
};