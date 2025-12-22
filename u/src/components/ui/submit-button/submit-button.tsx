import React from "react";

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
  return (
    <button type={type} className={className}>
      {data}
    </button>
  );
};
