import React from "react";
import { useFormContext, useFormState } from "react-hook-form";
import { CircleLoader } from "@/features/auth/sign-up-client/ui/circle-loader";

interface Props {
    type?: "submit";
    data: string;
    className?: string;
    disabled?: boolean;
}

export const SubmitButton: React.FC<Props> = ({
                                                  type = "submit",
                                                  data,
                                                  className,
                                                  disabled = false,
                                              }) => {
    const { control } = useFormContext();
    const { isSubmitting,  } = useFormState({ control });

    return (
        <button
            type={type}
            className={`${className ?? ""} ready`}
            disabled={disabled || isSubmitting}
        >
            {isSubmitting ? <CircleLoader/> : data}
        </button>
    );
};
