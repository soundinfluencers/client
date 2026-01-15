import React from "react";

interface Props {
  options: string[];
}

export const BarOptions: React.FC<Props> = ({ options }) => {
  const [active, setActive] = React.useState<number>(0);
  return (
    <ul className="bar-options">
      {options.map((item, i) => (
        <li
          onClick={() => setActive(i)}
          className={active === i ? "active" : ""}
          key={i}>
          {item} {i + 1}
        </li>
      ))}
    </ul>
  );
};
