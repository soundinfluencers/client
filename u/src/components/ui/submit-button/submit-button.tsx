import React from "react";
import { useFormContext, useFormState } from "react-hook-form";

interface Props {
  type?: "submit";
  data: string;
  className?: string;
}

export const SubmtiButton: React.FC<Props> = ({
  type = "submit",
  data,
  className,
}) => {
  const { control } = useFormContext();
  const { isValid, isSubmitting } = useFormState({ control });

  return (
    <button
      type={type}
      disabled={!isValid || isSubmitting}
      className={`${className ?? ""} ${isValid ? "ready" : "disabled"}`}>
      {isSubmitting ? "Saving..." : data}
    </button>
  );
};
