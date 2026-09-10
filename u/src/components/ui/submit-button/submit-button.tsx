import React from "react";
import { useFormContext, useFormState } from "react-hook-form";
import { CircleLoader } from "@/features/auth/sign-up-client/ui/circle-loader";

interface Props {
    type?: "submit";
    data: string;
    className?: string;
}

export const SubmitButton: React.FC<Props> = ({
                                                  type = "submit",
                                                  data,
                                                  className,
                                              }) => {
    const { control } = useFormContext();
    const { isSubmitting,  } = useFormState({ control });

    return (
        <button
            type={type}
            className={`${className ?? ""} ready`}
            disabled={isSubmitting}
        >
            {isSubmitting ? <CircleLoader/> : data}
        </button>
    );
};
