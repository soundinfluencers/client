import './_small-loader.scss';

export const SmallLoader = () => {
  return (
    <div className="small-loader">
      <div className="small-loader__dot" />
      <div className="small-loader__dot" />
      <div className="small-loader__dot" />
      <div className="small-loader__dot" />
    </div>
  );
};