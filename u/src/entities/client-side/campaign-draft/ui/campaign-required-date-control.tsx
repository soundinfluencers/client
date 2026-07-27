import { useEffect, useState } from "react";

type Props = {
    value?: string | null;
    disabled?: boolean;
    label: string;
    className?: string;
    onChange: (value: string) => void;
};

const toDateValue = (value?: string | null) =>
    /^\d{4}-\d{2}-\d{2}/.test(value ?? "") ? String(value).slice(0, 10) : "";

const today = () => new Date().toISOString().slice(0, 10);

export const CampaignRequiredDateControl = ({
    value,
    disabled = false,
    label,
    className,
    onChange,
}: Props) => {
    const dateValue = toDateValue(value);
    const [isScheduled, setIsScheduled] = useState(Boolean(dateValue));

    useEffect(() => {
        if (dateValue) setIsScheduled(true);
    }, [dateValue]);

    return (
        <div className={className}>
            <select
                value={isScheduled ? "scheduled" : "asap"}
                disabled={disabled}
                onChange={(event) => {
                    const scheduled = event.target.value === "scheduled";
                    setIsScheduled(scheduled);
                    if (!scheduled) onChange("ASAP");
                }}
                aria-label={`Date preference for ${label}`}
            >
                <option value="asap">ASAP</option>
                <option value="scheduled">Choose date</option>
            </select>
            {isScheduled && (
                <input
                    type="date"
                    min={today()}
                    value={dateValue}
                    onChange={(event) => onChange(event.target.value || "ASAP")}
                    disabled={disabled}
                    aria-label={`Required date for ${label}`}
                />
            )}
        </div>
    );
};
