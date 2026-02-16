import "./skeleton.scss";

export const CardSkeleton = () => {
  return (
    <div className="bs-card card-skeleton" aria-busy="true">
      <div className="card-skeleton__section-first">
        <div className="card-skeleton__section-first__content">
          <div className="circle" />
          <div className="cube-middle" />
        </div>
        <div className="card-skeleton__section-first__content">
          <div className="circle" />
          <div className="cube-middle" />
        </div>
      </div>

      <div className="card-skeleton__section-second">
        <div className="cube-big" />

        <div className="card-skeleton__section-second__content">
          <div className="cube-pre-big" />
          <div className="cube-small" />
        </div>
      </div>
    </div>
  );
};
