import React, {useEffect} from "react";

// Хук, срабатывающий при клике снаружи переданного рефа
export const useClickOutside = (
    ref: React.RefObject<HTMLDivElement | null>,
    callback: () => void
) => {
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                callback();
            }
        }

        document.addEventListener("mousedown", handleClick);

        return () => {
            document.removeEventListener("mousedown", handleClick);
        };
    }, [ref, callback]);
};