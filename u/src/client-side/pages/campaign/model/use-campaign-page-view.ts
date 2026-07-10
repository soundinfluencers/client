import React from "react";
import type { CampaignViewMode } from "./campaign-page.types";

export const useCampaignPageView = (data: any) => {
    const [optionModal, setOptionModal] = React.useState(false);
    const [activeOption, setActiveOption] = React.useState(0);
    const [changeView, setChangeView] = React.useState(false);
    const [view, setView] = React.useState<CampaignViewMode>(1);
    const [isRequesting, setIsRequesting] = React.useState(false);
    const [isRequestSent, setIsRequestSent] = React.useState(false);
    const [isRequestingPDF, setIsRequestingPDF] = React.useState(false);
    const [localExtraOptions, setLocalExtraOptions] = React.useState<number[]>([]);
    const [textareaValue, setTextareaValue] = React.useState("");
    const [flag, setFlag] = React.useState(true);

    React.useEffect(() => {
        if (data?.kind === "proposal") {
            setActiveOption((prev) => {
                const serverOption = data.selectedOption?.optionIndex;

                if (typeof serverOption === "number") {
                    return serverOption;
                }

                return prev;
            });

            setView((prev) => {
                if (prev === -1 || prev === 0 || prev === 2) return prev;
                return -1;
            });

            return;
        }

        if (data?.status === "distributing") {
            setFlag(false);
        }

        setView((prev) => {
            if (prev === 0 || prev === 1) return prev;
            return 1;
        });
    }, [data?.kind, data?.selectedOption?.optionIndex]);

    return {
        optionModal,
        setOptionModal,

        activeOption,
        setActiveOption,

        changeView,
        setChangeView,

        view,
        setView,

        isRequesting,
        setIsRequesting,

        isRequestSent,
        setIsRequestSent,

        isRequestingPDF,
        setIsRequestingPDF,

        localExtraOptions,
        setLocalExtraOptions,

        textareaValue,
        setTextareaValue,

        flag,
        setFlag,
    };
};
