import type React from "react";
import { useController, useFormContext } from 'react-hook-form';

import './_checkbox-button-list.scss';
import type { ICheckboxButton } from "./types/checkbox-buttons.types";
import type { TSocialAccountFormValues } from "../../types/account-setup.types";

interface Props {
  data: ICheckboxButton[];
  name: string;
  title: string;
  subtitle: string;
}

export const CheckboxButtonList: React.FC<Props> = ({ data, name, title, subtitle }) => {
  const { control } = useFormContext();

  const { field } = useController({
    name,
    control,
  });

  // const hasError = fieldState.invalid;

  const isMusicGenres = name === "musicGenres";

  const values = field.value ?? [];

  // console.log(values);

  const getGenre = (genre: string) => {
    // console.log(genre);

    return (values as TSocialAccountFormValues["musicGenres"]).find(g => g.genre === genre);
  };

  const getSelectedSubGenres = (genre: string) => {
    // console.log(genre);

    return getGenre(genre)?.subGenres ?? [];
  };

  const getChildrenValues = (parent: ICheckboxButton): string[] => {
    // console.log(parent);

    return parent.children?.map(c => c.value) ?? [];
  };

  // Parent is considered selected if at least one child is selected (for musicGenres)
  const isParentChecked = (parent: ICheckboxButton) => {
    if (!isMusicGenres) return (values as string[]).includes(parent.value);

    const children = getChildrenValues(parent);
    // console.log(children);
    if (children.length === 0) return !!getGenre(parent.value);

    return getSelectedSubGenres(parent.value).length > 0;
  };

  const toggleParent = (parent: ICheckboxButton) => {
    if (!isMusicGenres) {
      const list = values as string[];
      field.onChange(list.includes(parent.value) ? list.filter(v => v !== parent.value) : [...list, parent.value]);
      return;
    }

    const children = getChildrenValues(parent);
    const current = getSelectedSubGenres(parent.value);
    let newValues = [...(values as TSocialAccountFormValues["musicGenres"])];

    if (children.length === 0) {
      const exists = !!getGenre(parent.value);
      newValues = exists
        ? newValues.filter(g => g.genre !== parent.value)
        : [...newValues, { genre: parent.value, subGenres: [] }];
    } else {
      newValues = current.length > 0
        ? newValues.filter(g => g.genre !== parent.value)
        : [...newValues, { genre: parent.value, subGenres: children }];
    }

    field.onChange(newValues);
  };

  const toggleChild = (childValue: string, parent: ICheckboxButton) => {
    if (!isMusicGenres) {
      const list = values as string[];
      field.onChange(list.includes(childValue) ? list.filter(v => v !== childValue) : [...list, childValue]);
      return;
    }

    const genre = parent.value;
    const current = getGenre(genre);
    let newValues = [...(values as TSocialAccountFormValues["musicGenres"])];

    if (!current) {
      newValues.push({ genre, subGenres: [childValue] });
    } else {
      const updated = current.subGenres.includes(childValue)
        ? current.subGenres.filter(v => v !== childValue)
        : [...current.subGenres, childValue];

      newValues = updated.length === 0
        ? newValues.filter(g => g.genre !== genre)
        : newValues.map(g => g.genre === genre ? { ...g, subGenres: updated } : g);
    }

    field.onChange(newValues);
  };

  return (
    <div className={`checkbox-button-list`}>
      <div className='checkbox-button-list__header'>
        <p className="checkbox-button-list__title">{title}</p>
        <p className="checkbox-button-list__subtitle">{subtitle}</p>
      </div>

      {data.map(parent => (
        <div key={parent.id} className="checkbox-button-list__item">
          <div className='checkbox-button-list__item-parent'>
            <input
              type="checkbox"
              id={parent.id}
              checked={isParentChecked(parent)}
              onChange={() => toggleParent(parent)}
            />
            <label htmlFor={parent.id}>{parent.label}</label>
          </div>

          {parent.children && parent.children.length > 0 && (
            <div className="checkbox-button-list__children">
              {parent.children.map(child => (
                <div key={child.id} className="checkbox-button-list__child-item">
                  <input
                    type="checkbox"
                    id={child.id}
                    checked={isMusicGenres
                      ? getSelectedSubGenres(parent.value).includes(child.value)
                      : (values as string[]).includes(child.value)}
                    onChange={() => toggleChild(child.value, parent)}
                  />
                  <label htmlFor={child.id}>{child.label}</label>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};