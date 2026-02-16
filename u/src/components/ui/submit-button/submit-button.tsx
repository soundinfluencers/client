import React from "react";
import { useFormContext, useFormState } from "react-hook-form";

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

  const { isSubmitting, isValid } = useFormState({ control });
  console.log(isValid);
  return (
    <button
      type={type}
      className={`${className ?? ""} ${isValid ? "ready" : "disabled"}`}
      disabled={!isValid || isSubmitting}>
      {isSubmitting ? "Saving..." : data}
    </button>
  );
};
