import React from "react";
import csv from "@/assets/icons/iwwa_file-csv.svg";
import pdf from "@/assets/icons/iwwa_file-pdf.svg";
import share from "@/assets/icons/mdi-light_share.svg";
import link from "@/assets/icons/link (1).svg";

import {
    AddinitonalOption,
    ToggleTables,
    ViewAudience,
    ViewChange,
} from "@/client-side/ui";
import { OptionsSlider } from "@/client-side/widgets/campaign/components/option-slider";
import { isLockedStatus } from "../model/campaign-page.utils";
import {CircleLoader} from "@/features/auth/sign-up-client/ui/circle-loader";

type Props = {
    data: any;
    isProposal: boolean;
    view: number;
    setView: React.Dispatch<React.SetStateAction<any>>;
    changeView: boolean;
    setChangeView: React.Dispatch<React.SetStateAction<boolean>>;
    flag: boolean;
    setFlag: React.Dispatch<React.SetStateAction<boolean>>;
    optionIndexes: number[];
    activeOption: number;
    onClickOption: (idx: number) => void;
    onDeleteOption: (idx: number) => void;
    onOpenOptionModal: () => void;
    onCopyShareLink: () => void;
    onGetCSV: () => void;
    onGetPDF: () => void;
    isPending: boolean;
    isRequesting: boolean;
    isRequestingPDF: boolean;
};

export const CampaignPageControls: React.FC<Props> = ({
                                                          data,
                                                          isProposal,
                                                          view,
                                                          setView,
                                                          changeView,
                                                          setChangeView,
                                                          flag,
                                                          setFlag,
                                                          optionIndexes,
                                                          activeOption,
                                                          onClickOption,
                                                          onDeleteOption,
                                                          onOpenOptionModal,
                                                          onCopyShareLink,
                                                          onGetCSV,
                                                          onGetPDF,
                                                          isPending,
                                                          isRequesting,
                                                          isRequestingPDF,
                                                      }) => {
    if (isProposal) {
        return (
            <>
                <div className="controls">
                    {view === -1 && <AddinitonalOption onClick={onOpenOptionModal} />}

                    <OptionsSlider
                        optionIndexes={optionIndexes}
                        activeOption={activeOption}
                        onClickOption={onClickOption}
                        onDeleteOption={onDeleteOption}
                    />
                </div>


                <div className="controls-second">
                    {view !== 2 && (
                        <ViewAudience
                            flag={changeView}
                            onChange={() => setChangeView((prev) => !prev)}
                        />
                    )}

                    <div className="controls-second__content">
                        <ViewChange isProposal={isProposal} setView={setView} view={view} />
                        <div className="share-link-row-proposal">
                            <div onClick={onCopyShareLink} className="share-link-proposal">
                                <img src={link} alt="" />
                                {isPending ? "Copying..." : "Share link"}
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <div className="controls">
                {isLockedStatus(data?.status) && (
                    <ToggleTables
                        onChange={() => setFlag((prev) => !prev)}
                        flag={flag}
                    />
                )}

                <ViewChange isProposal={false} setView={setView} view={view} />

                {data?.status === "completed" ? (
                    <ul className="option-buttons">
                        <li onClick={onGetCSV}>
                            <img src={csv} alt="" />
                            {isRequesting ? <CircleLoader /> : "CSV File"}
                        </li>

                        <li onClick={onGetPDF}>
                            <img src={pdf} alt="" />
                            {isRequestingPDF ? <CircleLoader /> : "PDF File"}
                        </li>

                        <li onClick={onCopyShareLink}>
                            <img src={share} alt="" />
                            {isPending ? <CircleLoader /> : "Share link"}
                        </li>
                    </ul>
                ) : (
                    data?.kind === "regular" && (
                        <div className="share-link-row">
                            <div onClick={onCopyShareLink} className="share-link">
                                <img src={link} alt="" />
                                {isPending ? "Copying..." : "Share link"}
                            </div>
                        </div>
                    )
                )}
            </div>


                {data?.kind !== "proposal" &&
                    data?.kind !== "regular" &&
                    data?.kind !== "draft" &&
                    view === 1 && (
                        <div className="controls-second">
                        <div className="ViewAudience-block">
                            <ViewAudience
                                flag={changeView}
                                onChange={() => setChangeView((prev) => !prev)}
                            />
                        </div>
                    </div>
                    )}

        </>
    );
};