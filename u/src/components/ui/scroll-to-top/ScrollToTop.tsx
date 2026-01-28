import './_scroll-to-top.scss';

export const ScrollToTop = () => {
  return (
    <button
      className='scroll-to-top'
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    >
      ↑
    </button>
  );
};