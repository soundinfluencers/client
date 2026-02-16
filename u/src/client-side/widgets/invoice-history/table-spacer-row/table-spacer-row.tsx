import './_table-spacer-row.scss';

export const TableSpacerRow = ({ colSpan }: { colSpan: number }) => {
  return (
    <tr className="table-spacer-row">
      {Array.from({ length: colSpan }).map((_, index) => (
        <td key={index} className="table-spacer-row__cell" />
      ))}
    </tr>
  );
};