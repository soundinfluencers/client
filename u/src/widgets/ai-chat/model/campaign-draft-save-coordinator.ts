type DraftSaveHandler = () => Promise<boolean>;

const handlers = new Map<string, DraftSaveHandler>();

export const registerCampaignDraftSave = (
  draftId: string,
  handler: DraftSaveHandler,
) => {
  handlers.set(draftId, handler);
  return () => {
    if (handlers.get(draftId) === handler) handlers.delete(draftId);
  };
};

export const flushCampaignDraftSaves = async () => {
  const results = await Promise.all([...handlers.values()].map((handler) => handler()));
  return results.every(Boolean);
};
