type DateInputProps = {
  value?: string;
  onChange: (value: string) => void;
};
import "./date-input.scss";
export function DateInput({ value = "", onChange }: DateInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, "");

    if (v.length >= 3) v = v.slice(0, 2) + "." + v.slice(2);
    if (v.length >= 6) v = v.slice(0, 5) + "." + v.slice(5, 7);

    onChange(v);
  };

  return (
    <input
      type="text"
      placeholder="DD.MM.YY"
      maxLength={8}
      value={value}
      onChange={handleChange}
      className="date-input"
    />
  );
}
