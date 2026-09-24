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
  // React may register a newer closure while an earlier write is in flight.
  // Drain that latest edit before the editor unmounts and cancels its debounce.
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const snapshot = [...handlers.entries()];
    const results = await Promise.all(snapshot.map(([, handler]) => handler()));
    if (!results.every(Boolean)) return false;
    if (snapshot.length === handlers.size && snapshot.every(([id, handler]) => handlers.get(id) === handler)) return true;
  }
  return false;
};
