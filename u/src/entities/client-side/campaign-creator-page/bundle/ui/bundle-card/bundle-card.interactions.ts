const INTERACTIVE_CARD_TARGET_SELECTOR = [
    "button",
    "a[href]",
    "input",
    "select",
    "textarea",
    "summary",
    "label",
    "[role='button']",
    "[role='link']",
    "[contenteditable='true']",
].join(",");

export const canToggleBundleFromCard = ({
    isSelected,
    chooseDisabled,
    isIncludedInSelectedOffer,
}: {
    isSelected: boolean;
    chooseDisabled: boolean;
    isIncludedInSelectedOffer: boolean;
}): boolean =>
    !isIncludedInSelectedOffer &&
    (isSelected || !chooseDisabled);

export const isBundleCardSurfaceClick = (
    target: EventTarget | null,
): boolean => {
    const element = target as {
        closest?: (selector: string) => unknown;
    } | null;

    return (
        typeof element?.closest === "function" &&
        element.closest(INTERACTIVE_CARD_TARGET_SELECTOR) === null
    );
};
