import React from "react";

import chevron from "@/assets/icons/chevron-right.svg";
import x from "@/assets/icons/x (1).svg";

import { Modal } from "@/components/ui/modal-fix/Modal";
import { ButtonMain, ButtonSecondary } from "@/shared/ui";

import styles from "./proposal-options.module.scss";

type Props = {
    optionIndexes: number[];
    activeOption: number;
    onClickOption: (idx: number) => void;
    onDeleteOption: (idx: number) => void;
    isPending?: boolean;
};

export const OptionsSlider = ({
                                  optionIndexes,
                                  activeOption,
                                  onClickOption,
                                  onDeleteOption,
                                  isPending,
                              }: Props) => {
    const scrollerRef = React.useRef<HTMLUListElement | null>(null);

    const [canScroll, setCanScroll] = React.useState(false);
    const [atStart, setAtStart] = React.useState(true);
    const [atEnd, setAtEnd] = React.useState(false);

    const [modal, setModal] = React.useState(false);
    const [activeChooseOption, setActiveChooseOption] = React.useState(activeOption);

    const canDelete = optionIndexes.length > 1;

    const update = React.useCallback(() => {
        const el = scrollerRef.current;
        if (!el) return;

        const can = el.scrollWidth > el.clientWidth + 1;

        setCanScroll(can);
        setAtStart(el.scrollLeft <= 0);
        setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 1);
    }, []);

    React.useEffect(() => {
        update();

        const el = scrollerRef.current;
        if (!el) return;

        const onScroll = () => update();

        el.addEventListener("scroll", onScroll, { passive: true });

        const ro = new ResizeObserver(() => update());
        ro.observe(el);

        return () => {
            el.removeEventListener("scroll", onScroll);
            ro.disconnect();
        };
    }, [update, optionIndexes.length]);

    const scrollByPage = React.useCallback((dir: -1 | 1) => {
        const el = scrollerRef.current;
        if (!el) return;

        el.scrollBy({
            left: dir * Math.round(el.clientWidth * 0.8),
            behavior: "smooth",
        });
    }, []);

    return (
        <div className={styles.optionsSlider}>
            {canScroll && (
                <button
                    type="button"
                    className={`${styles.optionsSlider__arrow} ${styles.left}`}
                    onClick={() => scrollByPage(-1)}
                    disabled={atStart || isPending}
                    aria-label="Scroll left"
                >
                    <img
                        style={{ transform: "rotate(180deg)" }}
                        src={chevron}
                        alt=""
                    />
                </button>
            )}

            <ul ref={scrollerRef} className={styles.optionList}>
                {optionIndexes.map((idx) => (
                    <li
                        key={idx}
                        className={activeOption === idx ? styles.activeOption : ""}
                        onClick={() => {
                            if (isPending) return;
                            onClickOption(idx);
                        }}
                    >
                        Option {idx + 1}

                        {canDelete && (
                            <img
                                onClick={(e) => {
                                    e.stopPropagation();

                                    if (isPending) return;

                                    setActiveChooseOption(idx);
                                    setModal(true);
                                }}
                                src={x}
                                alt=""
                            />
                        )}
                    </li>
                ))}
            </ul>

            {canScroll && (
                <button
                    type="button"
                    className={`${styles.optionsSlider__arrow} ${styles.right}`}
                    onClick={() => scrollByPage(1)}
                    disabled={atEnd || isPending}
                    aria-label="Scroll right"
                >
                    <img src={chevron} alt="" />
                </button>
            )}

            {modal && (
                <Modal isShowCloseButton={false} onClose={() => setModal(false)}>
                    <div className="create-option">
                        <h2>
                            Are you sure you want to <br />
                            delete this Option {activeChooseOption + 1}?
                        </h2>

                        <p>You won’t be able to restore this!</p>

                        <div className="create-option-btn">
                            <ButtonSecondary
                                className="btn"
                                text="Cancel"
                                onClick={() => setModal(false)}
                            />

                            <ButtonMain
                                className="btn"
                                text="Delete"
                                onClick={() => {
                                    onDeleteOption(activeChooseOption);
                                    setModal(false);
                                }}
                            />
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};