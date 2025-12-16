import type { ReactNode } from 'react';
import './_form.scss';

interface Props {
  children: ReactNode;
  onSubmit: () => void;
}

export const Form: React.FC<Props> = ({ children, onSubmit }) => {
  return (
    <form className='form'>
      {children}
    </form>
  )
}
