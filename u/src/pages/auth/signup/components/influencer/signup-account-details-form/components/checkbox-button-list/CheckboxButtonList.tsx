import './_checkbox-button-list.scss';
import type React from "react";
import type { ICheckboxButton } from "../../../../../../../../constants/influencer/checkbox-button.data";
import { useController, type Control } from 'react-hook-form';
import type { IAccountFormValues } from '../../../../../../../../types/user/influencer.types';

interface Props {
  data: ICheckboxButton[];
  title?: string;
  subtitle?: string;
  control: Control<IAccountFormValues>;
  nameParent: keyof IAccountFormValues;
  nameChildren?: keyof IAccountFormValues;
}

//TODO: Needd to fix the logic for parent toggle and child toggles
export const CheckboxButtonList: React.FC<Props> = ({ data, title, subtitle, control, nameParent, nameChildren }) => {
  const { field: parentField } = useController({
    name: nameParent,
    control,
  });

  const childController = nameChildren ? useController({ name: nameChildren, control }) : null;

  const childField = childController?.field;

  const parentValue = parentField.value as string | undefined;
  const childValues = (childField?.value as string[]) ?? [];

  const getChildValues = (parent: ICheckboxButton): string[] => {
    if (!parent.children) {
      return [];
    }
    return parent.children.map(child => child.value);
  };

  const onParentToggle = (value: ICheckboxButton) => {
    const isActive = parentValue === value.value;
    const children = getChildValues(value);

    if (isActive) {
      parentField.onChange(undefined);
      childField?.onChange([]);
    } else {
      parentField.onChange(value.value);
      if (childField && children.length > 0) {
        childField.onChange(children);
      }
    }
  };

  const onChildToggle = (parent: ICheckboxButton, value: string) => {
    if (!childField) {
      return;
    }

    const next = childValues.includes(value) ? childValues.filter(v => v !== value) : [...childValues, value];

    childField.onChange(next);

    const allChildren = getChildValues(parent);

    if (next.length === 0) {
      parentField.onChange(undefined);
    } else if (allChildren.every(v => next.includes(v))) {
      parentField.onChange(parent.value);
    }
  };

  const isParentChecked = (value: ICheckboxButton): boolean => {
    return parentField.value === value.value;
  };

  const isChildChecked = (value: string): boolean => {
    return childValues.includes(value);
  };

  return (
    <div className='checkbox-button-list'>
      <div className='checkbox-button-list__header'>
        <p className="checkbox-button-list__title">{title}</p>
        <p className="checkbox-button-list__subtitle">{subtitle}</p>
      </div>

      {data.map(item => (
        <div key={item.id} className="checkbox-button-list__item">
          <div className='checkbox-button-list__item-parent'>
            <input
              type="checkbox"
              id={item.id}
              checked={isParentChecked(item)}
              onChange={() => onParentToggle(item)}
            />
            <label htmlFor={item.id}>{item.label}</label>
          </div>

          {item.children && item.children.length > 0 && (
            <div className="checkbox-button-list__children">
              {item.children.map(child => (
                <div key={child.id} className="checkbox-button-list__child-item">
                  <input
                    type="checkbox"
                    id={child.id}
                    checked={isChildChecked(child.value)}
                    onChange={() => onChildToggle(item, child.value)}
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