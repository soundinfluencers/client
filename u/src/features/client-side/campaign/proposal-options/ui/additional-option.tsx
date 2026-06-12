import React from "react";

import filePlus from "@/assets/bar-home/file-plus.svg";
import styles from "./proposal-options.module.scss";

type Props = {
    onClick: () => void;
    isPending?: boolean;
};

export const AdditionalOption: React.FC<Props> = ({ onClick, isPending }) => {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={isPending}
            className={styles.additionalOption}
        >
            <img src={filePlus} alt="" />
            <p>{isPending ? "Creating..." : "Create additional proposal option"}</p>
        </button>
    );
};