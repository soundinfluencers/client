import React from "react";
import pdf from "@/assets/icons/iwwa_file-pdf.svg";
import csv from "@/assets/icons/iwwa_file-csv.svg";
import { useCampaignFiles } from "../model/use-campaign-files";

import styles from "./campaign-files-buttons.module.scss";
import {CircleLoader} from "@/features/auth/sign-up-client/ui/circle-loader";

type Props = {
    campaignId?: string;
    campaignName?: string;
};

export const CampaignFilesButtons: React.FC<Props> = ({
                                                          campaignId,
                                                          campaignName,
                                                      }) => {
    const { pendingType, downloadCsv, downloadPdf } = useCampaignFiles({
        campaignId,
        campaignName,
    });

    return (
        <div className={styles.filesButtons}>
            <button
                type="button"
                onClick={downloadCsv}
                disabled={Boolean(pendingType)}
                className={styles.fileButton}
            >
                <img src={csv} alt=""/>
                {pendingType === "csv" ? <CircleLoader/> : "CSV File"}
            </button>

            <button
                type="button"
                onClick={downloadPdf}
                disabled={Boolean(pendingType)}
                className={styles.fileButton}
            >
                <img src={pdf} alt=""/>
                {pendingType === "pdf" ? <CircleLoader/> : "PDF File"}
            </button>
        </div>
    );
};