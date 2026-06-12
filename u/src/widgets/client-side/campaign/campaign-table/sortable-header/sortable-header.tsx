import type { Column } from "@tanstack/react-table";

import up from "@/assets/icons/chevron-up.svg";
import down from "@/assets/icons/chevron-up.svg";

import styles from "./sortable-header.module.scss";

type Props<TData> = {
    title: string;
    column: Column<TData, unknown>;
};

export const SortableHeader = <TData,>({ title, column }: Props<TData>) => {
    const sort = column.getIsSorted();

    return (
        <button
            type="button"
            onClick={column.getToggleSortingHandler()}
            className={`${styles.sortHeader} ${sort ? styles.active : ""}`}
        >
            <span>{title}</span>

            <span className={styles.icons}>
                <img
                    src={up}
                    alt=""
                    className={sort === "asc" ? styles.iconActive : ""}
                />
               <img
                   src={down}
                   alt=""
                   style={{ transform: "rotate(180deg)" }}
                   className={sort === "desc" ? styles.iconActive : ""}
               />
            </span>
        </button>
    );
};