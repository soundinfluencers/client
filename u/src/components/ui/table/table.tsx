import type { TableProps } from "../../../types/client/creator-campaign/table.types";
import "./_table.scss";

export function Table<T>({ columns, data, className, footer }: TableProps<T>) {
  return (
    <div className={`table ${className ?? ""}`}>
      <div className="table__header">
        {columns.map((col) => (
          <div key={col.key} className="table__header-data">
            {col.title}
          </div>
        ))}
      </div>

      {data.map((row, rowIndex) => (
        <div key={rowIndex} className="table__body-row">
          {columns.map((col) => (
            <div key={col.key} className="table__body-data">
              {col.render ? col.render(row) : (row as any)[col.key]}
            </div>
          ))}
        </div>
      ))}

      {footer && <div className="table__footer-row">{footer}</div>}
    </div>
  );
}
