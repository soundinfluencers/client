import React from "react";

export const useDraftSaveModal = () => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [draftName, setDraftName] = React.useState("");

    const open = React.useCallback(() => {
        setDraftName("");
        setIsOpen(true);
    }, []);

    const close = React.useCallback(() => {
        setIsOpen(false);
    }, []);

    return {
        isOpen,
        draftName,
        setDraftName,
        open,
        close,
    };
};