import React from "react";
import { toast } from "react-toastify";

import {
    getCampaignCsv,
    getCampaignPdf,
} from "@/entities/client-side/campaign/api/campaign-files.api";

type FileType = "csv" | "pdf";

type Params = {
    campaignId?: string;
    campaignName?: string;
};

const downloadBlob = ({
                          blob,
                          fileName,
                      }: {
    blob: Blob;
    fileName: string;
}) => {
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(url);
};

const normalizeFileName = (value?: string) => {
    return String(value ?? "campaign")
        .trim()
        .replace(/[^\wа-яА-ЯёЁ\- ]+/g, "")
        .replace(/\s+/g, "-")
        .toLowerCase();
};

export const useCampaignFiles = ({ campaignId, campaignName }: Params) => {
    const [pendingType, setPendingType] = React.useState<FileType | null>(null);

    const downloadCsv = React.useCallback(async () => {
        if (!campaignId || pendingType) return;

        try {
            setPendingType("csv");

            const response = await getCampaignCsv(campaignId);

            downloadBlob({
                blob: response.data,
                fileName: `${normalizeFileName(campaignName)}.csv`,
            });

            toast.success("CSV file downloaded");
        } catch (error) {
            console.error(error);
            toast.error("Failed to download CSV file");
        } finally {
            setPendingType(null);
        }
    }, [campaignId, campaignName, pendingType]);

    const downloadPdf = React.useCallback(async () => {
        if (!campaignId || pendingType) return;

        try {
            setPendingType("pdf");

            const response = await getCampaignPdf(campaignId);

            downloadBlob({
                blob: response.data,
                fileName: `${normalizeFileName(campaignName)}.pdf`,
            });

            toast.success("PDF file downloaded");
        } catch (error) {
            console.error(error);
            toast.error("Failed to download PDF file");
        } finally {
            setPendingType(null);
        }
    }, [campaignId, campaignName, pendingType]);

    return {
        pendingType,
        downloadCsv,
        downloadPdf,
    };
};