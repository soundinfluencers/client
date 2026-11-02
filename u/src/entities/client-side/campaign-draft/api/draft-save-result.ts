// Active draft wrappers return AxiosResponse without unwrapping its body.
export const getSavedDraftId = (response: unknown, currentDraftId: string | null): string => {
    const id = (response as { data?: { data?: { draftId?: unknown } } })?.data?.data?.draftId;
    if (typeof id === "string" && id.trim()) {
        if (currentDraftId && id !== currentDraftId) {
            throw new Error("Draft response refers to a different draft. Please reopen your draft before continuing.");
        }
        return id;
    }
    if (currentDraftId) return currentDraftId;
    throw new Error("The draft was saved but its ID was not returned. Please reopen it from the dashboard before continuing.");
};
