import './_error.scss';

export const Error = () => {
  return (
    <div className="error">
      <h2 className="error__title">Something went wrong</h2>
      <p className="error__description">Please try again later.</p>
    </div>
  );
};