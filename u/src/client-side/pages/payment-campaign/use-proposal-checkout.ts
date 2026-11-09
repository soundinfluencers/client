import React from "react";
import { approveProposalCampaign, getProposalCampaign, type ApproveProposalCampaignBody } from "@/api/client/campaign/campaign.api";
import type { CheckoutContext } from "./checkout-context";
import { proposalApprovalPayment, proposalCheckoutFingerprint, readProposalCheckout, type SavedProposalCheckout } from "./proposal-checkout";

type Status = "idle" | "loading" | "ready" | "error" | "submitting" | "completed" | "uncertain";
type Receipt = { attemptId: string; optionIndex: number; status: "pending" | "uncertain" | "completed" };
type Session = { key: string; pageKey: string; receiptKey: string; version: number; status: Status; saved: SavedProposalCheckout | null; message: string | null; lock: boolean; attemptId: string | null; blockedByReceipt: boolean };

const readReceipt = (key: string): Receipt | null => {
    const raw = sessionStorage.getItem(key);
    if (raw) {
        try {
            const receipt = JSON.parse(raw);
            if (typeof receipt?.attemptId === "string" && ["pending", "uncertain", "completed"].includes(receipt.status)) return receipt;
        } catch { /* Older string receipts and malformed markers must also fail closed. */ }
        return { attemptId: "legacy", optionIndex: -1, status: raw === "completed" ? "completed" : "uncertain" };
    }
    // Receipts written by the earlier option-scoped version still block the whole Proposal after F5.
    for (let i = 0; i < sessionStorage.length; i++) {
        const legacyKey = sessionStorage.key(i);
        if (legacyKey?.startsWith(`${key}:`) && sessionStorage.getItem(legacyKey)) {
            return { attemptId: "legacy", optionIndex: -1,
                status: sessionStorage.getItem(legacyKey) === "completed" ? "completed" : "uncertain" };
        }
    }
    return null;
};

// A checkout-local keyed reader. It never publishes into the shared private Proposal reader/store.
export const useProposalCheckout = (context: CheckoutContext, authorized: boolean, pageKey: string) => {
    const key = context.kind === "proposal" ? `${context.proposalId}:${context.optionIndex}` : "";
    const active = React.useRef<Session | null>(null);
    const mounted = React.useRef(false);
    const permission = React.useRef(authorized);
    permission.current = authorized;
    const [, render] = React.useState(0);
    if (active.current?.key !== key || active.current?.pageKey !== pageKey) {
        const receiptKey = context.kind === "proposal" ? `proposalApprove:${context.proposalId}` : "";
        active.current = { key, pageKey, receiptKey, version: 0, saved: null, lock: false,
            attemptId: null, blockedByReceipt: false, status: "idle", message: null };
    }
    const session = active.current;
    const owns = () => mounted.current && active.current === session;
    const publish = () => { if (owns()) render((n) => n + 1); };
    React.useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);

    // Read ownership stays option-local; approve consumes the whole Proposal, regardless of its index.
    const receiptBlocks = () => {
        if (!session.receiptKey) return false;
        if (session.status === "completed" && session.attemptId && !session.blockedByReceipt) return true;
        try {
            const receipt = readReceipt(session.receiptKey);
            if (!receipt) {
                if (session.blockedByReceipt) {
                    session.blockedByReceipt = false; session.status = "error";
                    session.message = "The other approval attempt was rejected. Reload the saved option before confirming again.";
                }
                return false;
            }
            if (receipt.attemptId === session.attemptId) return true;
            session.blockedByReceipt = true;
            session.status = receipt.status === "completed" ? "completed" : "uncertain";
            session.message = receipt.status === "completed" ? "Proposal approval completed. Do not submit any option again."
                : receipt.status === "pending" ? "Approval of this Proposal is pending. Do not submit another option. If the outcome is unknown, contact support."
                : "The previous approval outcome is unknown. Do not submit any option again; contact support to verify the payment.";
            return true;
        } catch {
            session.status = "error";
            session.message = "Cannot verify local approval status. Retry reading before approval.";
            return true;
        }
    };
    receiptBlocks();

    // Only the attempt that acquired the campaign-level receipt may settle or release it.
    const settleReceipt = (status: Receipt["status"] | null) => {
        try {
            const receipt = readReceipt(session.receiptKey);
            if (receipt?.attemptId !== session.attemptId) { receiptBlocks(); return; }
            if (status) sessionStorage.setItem(session.receiptKey, JSON.stringify({ ...receipt, status }));
            else sessionStorage.removeItem(session.receiptKey);
        } catch { /* A storage failure never unlocks a known successful or ambiguous write. */ }
    };

    const load = async () => {
        if (context.kind !== "proposal" || !owns() || session.lock) return false;
        if (receiptBlocks()) { publish(); return false; }
        const version = ++session.version;
        session.status = "loading"; session.message = null; publish();
        try {
            const response = await getProposalCampaign(context.proposalId, context.optionIndex);
            if (!owns() || version !== session.version) return false;
            if (receiptBlocks()) { publish(); return false; }
            session.saved = readProposalCheckout(response, context.proposalId, context.optionIndex);
            session.status = "ready"; publish(); return true;
        } catch (error) {
            if (!owns() || version !== session.version) return false;
            session.saved = null; session.status = "error";
            session.message = error instanceof Error ? error.message : "Failed to load the saved Proposal option.";
            publish(); return false;
        }
    };
    React.useEffect(() => { void load(); }, [key, pageKey]);

    const approve = async (payment: ApproveProposalCampaignBody) => {
        if (!owns()) return false;
        if (receiptBlocks()) { publish(); return false; }
        if (!owns() || !permission.current || context.kind !== "proposal" || session.lock || session.status !== "ready" || !session.saved) return false;
        session.lock = true; session.status = "submitting"; session.message = null; publish();
        let sent = false;
        try {
            // Revalidate the exact saved selection before mutation. A changed read needs a NEW explicit click.
            const version = ++session.version;
            const response = await getProposalCampaign(context.proposalId, context.optionIndex);
            if (!owns() || version !== session.version || !permission.current) return false;
            if (receiptBlocks()) return false;
            const fresh = readProposalCheckout(response, context.proposalId, context.optionIndex);
            const changed = proposalCheckoutFingerprint(fresh) !== proposalCheckoutFingerprint(session.saved);
            session.saved = fresh;
            if (changed) {
                session.status = "ready";
                session.message = "The saved option changed. Review the updated summary and confirm again.";
                return false;
            }
            // Synchronous check + claim after preflight: no await may split this Proposal-wide lock.
            if (receiptBlocks()) return false;
            const receipt: Receipt = { attemptId: crypto.randomUUID(), optionIndex: context.optionIndex, status: "pending" };
            sessionStorage.setItem(session.receiptKey, JSON.stringify(receipt));
            session.attemptId = receipt.attemptId;
            sent = true;
            await approveProposalCampaign(context.proposalId, context.optionIndex, proposalApprovalPayment(payment));
            // void is a valid success. No GET can recover the newly created identity: Proposal is consumed.
            session.status = "completed";
            session.message = "Proposal approved successfully. Its campaign is awaiting review.";
            settleReceipt("completed");
            return owns();
        } catch (error) {
            const status = (error as { response?: { status?: number } })?.response?.status;
            if (sent && (!status || status >= 500 || status === 408)) {
                session.status = "uncertain";
                session.message = "The approval outcome is unknown. Do not submit again; contact support to verify the payment.";
                settleReceipt("uncertain");
            } else {
                session.status = "error";
                session.message = sent
                    ? "Approval was rejected. Your payment details are preserved. Reload the saved option before confirming again."
                    : error instanceof Error ? error.message : "Could not verify the saved option. Retry reading before approval.";
                // A failed fresh read or rejection must never leave an old summary ready for submission.
                session.saved = null;
                if (sent) settleReceipt(null);
            }
            return false;
        } finally {
            session.lock = false;
            if (session.status === "submitting") session.status = "error";
            publish();
        }
    };

    return { saved: session.saved, status: session.status, message: session.message, load, approve,
        canSubmit: authorized && session.status === "ready" && !!session.saved,
        busy: session.status === "loading" || session.status === "submitting" };
};
