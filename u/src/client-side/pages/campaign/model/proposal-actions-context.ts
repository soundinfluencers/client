import { createContext } from "react";
export const ProposalActionsContext = createContext<{
    onDeleteOption?: (index: number) => Promise<boolean>;
    onAddInfluencer?: (index: number) => boolean;
    isMutationPending: boolean;
}>({ isMutationPending: false });
