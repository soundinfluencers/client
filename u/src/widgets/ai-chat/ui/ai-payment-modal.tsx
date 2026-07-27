import { useEffect, useState } from "react";
import { Modal } from "@/shared/ui/modal-fix/Modal";
import { PaymentCampaign } from "@/client-side";
import { getCampaignDraft } from "@/entities/client-side/campaign-draft/api/campaign-draft.api.ts";
import {
    hydrateCampaignBuilderFromDraft,
} from "@/entities/client-side/campaign-creator-page/campaign-builder/model/hydrate-campaign-builder-from-draft";
import { isDraftReadyForCheckout } from "@/entities/client-side/campaign-draft/model/ai-campaign-draft.model.ts";

interface Props {
    draftId: string;
    onClose: () => void;
}

// In-chat checkout: hydrates the builder store from the finalized draft (same as the
// deep-link path) and renders the app's own PaymentCampaign inside a modal, so the
// client completes the whole campaign without leaving the chat page. The agent never
// touches the payment itself — this is the human's screen.
export const AiPaymentModal = ({ draftId, onClose }: Props) => {
    const [state, setState] = useState<"loading" | "ready" | "not-ready" | "error">("loading");

    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                const draft = await getCampaignDraft(draftId);
                if (cancelled) return;
                if (!isDraftReadyForCheckout(draft)) {
                    setState("not-ready");
                    return;
                }
                hydrateCampaignBuilderFromDraft(draft);
                setState("ready");
            } catch {
                if (!cancelled) setState("error");
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [draftId]);

    return (
        <Modal onClose={onClose} addStyles="content-width">
            <div style={{ maxHeight: "85vh", overflowY: "auto", minWidth: "min(720px, 90vw)" }}>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button onClick={onClose} style={{ fontSize: "16px", padding: "4px 12px" }}>
                        ✕
                    </button>
                </div>

                {state === "loading" && <p style={{ padding: "24px" }}>Loading your campaign…</p>}
                {state === "error" && (
                    <p style={{ padding: "24px" }}>
                        Could not load this campaign draft. Please try again from your dashboard.
                    </p>
                )}
                {state === "not-ready" && (
                    <div style={{ padding: "24px" }}>
                        <strong>Campaign content is not ready yet.</strong>
                        <p>Add a valid content URL and post description for every selected page before checkout.</p>
                    </div>
                )}
                {state === "ready" && <PaymentCampaign />}
            </div>
        </Modal>
    );
};
