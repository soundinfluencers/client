import "./skeleton.scss";

export const TableCardSkeleton = () => {
  return (
    <div className="table-card" aria-busy="true">
      <div className="table-card__skeleton">
        <div className="circle" />
        <div className="cube-middle" />
      </div>
    </div>
  );
};
