import React from "react";
import repeat from "@/assets/icons/Vector (14).svg";
import styles from "./view-audience.module.scss";

type Props = {
    flag: boolean;
    onChange: () => void;
};

export const ViewAudience: React.FC<Props> = ({ onChange, flag }) => {
    return (
        <div className={styles.viewAudience}>
            <div
                onClick={onChange}
                className={`${styles.button} ${flag ? styles.active : ""}`}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onChange();
                    }
                }}
            >
                <img src={repeat} alt="" />
                <p>Advanced Insights</p>
            </div>
        </div>
    );
};