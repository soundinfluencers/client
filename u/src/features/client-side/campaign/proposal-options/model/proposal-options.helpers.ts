const LAST_CAMPAIGN_KEY = "lastCampaign";

export const writeLastProposalOption = ({
                                            campaignId,
                                            optionIndex,
                                        }: {
    campaignId: string;
    optionIndex: number;
}) => {
    sessionStorage.setItem(
        LAST_CAMPAIGN_KEY,
        JSON.stringify({
            id: campaignId,
            status: "proposal",
            optionIndex,
        }),
    );
};

export const getNextAvailableOptionIndex = (existingOptions: number[]) => {
    if (!existingOptions.length) return 0;

    return Math.max(...existingOptions) + 1;
};

export const getNextOptionAfterDelete = ({
                                             deletedOption,
                                             existingOptions,
                                         }: {
    deletedOption: number;
    existingOptions: number[];
}) => {
    const nextOptions = existingOptions.filter((item) => item !== deletedOption);

    if (!nextOptions.length) return null;

    return nextOptions[0];
};