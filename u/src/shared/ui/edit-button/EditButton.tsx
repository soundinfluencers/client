import './_edit-button.scss';

import editIcon from '@/assets/icons/edit.svg';

interface EditButtonProps {
  variants: 'account' | 'social';
  onClick: () => void;
  className?: string;
};

export const EditButton = ({ variants, onClick, className }: EditButtonProps) => {
  return (
    <button
      className={`edit-button edit-button--${variants} ${className || ''}`}
      onClick={onClick}
    >
      Edit
      <img src={editIcon} alt="Edit Icon" />
    </button>
  );
};