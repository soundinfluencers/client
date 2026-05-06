import React from "react";
import chevron from "@/assets/icons/chevron-down.svg";
import styles from "./tags-dropdown.module.scss";

type Props = {
    items: string[];
    placeholder?: string;
};

export const TagsDropdown: React.FC<Props> = ({ items, placeholder = "—" }) => {
    const [open, setOpen] = React.useState(false);
    const ref = React.useRef<HTMLDivElement | null>(null);
    const [isMobile, setIsMobile] = React.useState(false);

    React.useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth <= 600);
        onResize();
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    React.useEffect(() => {
        const onDocClick = (e: MouseEvent) => {
            if (!ref.current) return;
            if (!ref.current.contains(e.target as Node)) setOpen(false);
        };

        document.addEventListener("mousedown", onDocClick);
        return () => document.removeEventListener("mousedown", onDocClick);
    }, []);

    const list = items?.filter(Boolean) ?? [];
    const preview = list.length ? list.slice(0, 1) : [];

    return (
        <div
            className={`${styles.root} ${isMobile ? styles.mobile : ""}`}
            ref={ref}
        >
            <button
                type="button"
                className={styles.button}
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
            >
                <div className={styles.preview}>
                    {!isMobile && (
                        <>
                            {preview.length ? (
                                preview.map((item, index) => (
                                    <span className={styles.tag} key={index} title={item}>
                                        {item}
                                    </span>
                                ))
                            ) : (
                                <span className={styles.placeholder}>{placeholder}</span>
                            )}

                            {list.length > 1 && (
                                <span className={styles.more}>+{list.length - 1}</span>
                            )}
                        </>
                    )}
                </div>

                <img
                    className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`}
                    src={chevron}
                    alt=""
                />
            </button>

            {open && (
                <div className={styles.menu} role="listbox">
                    {list.length ? (
                        list.map((item, index) => (
                            <div className={styles.item} key={index} title={item}>
                                {item}
                            </div>
                        ))
                    ) : (
                        <div className={styles.empty}>No data</div>
                    )}
                </div>
            )}
        </div>
    );
};