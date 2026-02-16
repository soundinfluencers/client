type EditableCellProps = {
  value?: string;
  onChange: (v: string) => void;
  placeholder?: string;
};

export const EditableCell = ({
  value,
  onChange,
  placeholder,
}: EditableCellProps) => {
  return (
    <input
      className="table-input"
      value={value ?? ""}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  );
};
