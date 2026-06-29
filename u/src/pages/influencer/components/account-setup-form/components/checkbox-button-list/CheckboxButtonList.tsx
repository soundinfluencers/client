import type React from "react";
import { useMemo } from "react";
import { useController, useFormContext } from 'react-hook-form';

import type { NestedOption } from "./types/checkbox-buttons.types";
import {
  buildTreeMetaMap,
  getNextSelectedValues,
} from "./utils/tree-options.helpers";
import './_checkbox-button-list.scss';

interface Props {
  data: NestedOption[];
  name: string;
  title: string;
  subtitle: string;
}

export const CheckboxButtonList: React.FC<Props> = ({ data, name, title, subtitle }) => {
  const { control } = useFormContext();

  const { field, fieldState } = useController({
    name,
    control,
  });

  // console.log(name);
  // console.log(name, getValues(name), fieldState.error);
  // console.log(name, field.value, fieldState.error?.message);

  const errorMessage = fieldState.error?.message;
  // console.log(errorMessage);

  const metaMap = useMemo(() => buildTreeMetaMap(data), [data]);

  const values = Array.isArray(field.value) ? field.value as string[] : [];

  // console.log(values);

  const toggleOption = (option: NestedOption) => {
    field.onChange(getNextSelectedValues(option, values, metaMap, data));
  };

  const renderOptions = (options: NestedOption[], level = 0) => options.map((option) => (
    <div
      key={option.value}
      className={level === 0 ? "checkbox-button-list__item" : "checkbox-button-list__child-item"}
    >
      <div className='checkbox-button-list__item-parent'>
        <input
          type="checkbox"
          id={`${name}-${option.value}`}
          checked={values.includes(option.value)}
          onChange={() => toggleOption(option)}
        />
        <label htmlFor={`${name}-${option.value}`}>{option.label}</label>
      </div>

      {option.children && option.children.length > 0 && (
        <div className="checkbox-button-list__children">
          {renderOptions(option.children, level + 1)}
        </div>
      )}
    </div>
  ));

  return (
    <div className={`checkbox-button-list`}>
      <div className='checkbox-button-list__header'>
        <span className={`checkbox-button-list__title ${errorMessage ? 'checkbox-button-list__title--error' : ''}`}>
          {title}
          {errorMessage && <p className={`checkbox-button-list__error`}>{errorMessage}</p>}
        </span>
        <p className="checkbox-button-list__subtitle">{subtitle}</p>
      </div>

      {renderOptions(data)}
    </div>
  );
};
