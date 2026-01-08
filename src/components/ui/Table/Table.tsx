import type { TableProps as TablePropsType } from './Table.types';
import './Table.css';

/**
 * Table - Reusable table component
 * Supports different variants and responsive design
 */
const Table: React.FC<TablePropsType> = ({
  children,
  columns,
  data,
  variant = 'default',
  hover = true,
  compact = false,
  className = '',
  emptyMessage = 'No data available',
  ...props
}) => {
  const baseClassName = 'table';
  const variantClass = `table--${variant}`;
  const hoverClass = hover ? 'table--hover' : '';
  const compactClass = compact ? 'table--compact' : '';

  return (
    <div
      className={`${baseClassName} ${variantClass} ${hoverClass} ${compactClass} ${className}`.trim()}
      {...props}
    >
      <table className="table__element">
        <thead className="table__head">
          <tr className="table__row">
            {columns.map(column => (
              <th key={column.key} className="table__header">
                {column.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="table__body">
          {data.length === 0 ? (
            <tr className="table__row">
              <td
                colSpan={columns.length}
                className="table__cell table__cell--empty"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="table__row"
              >
                {columns.map(column => (
                  <td key={column.key} className="table__cell">
                    {column.render ? (
                      column.render(row, rowIndex)
                    ) : (
                      String(row[column.key as keyof typeof row])
                    )}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {children && (
        <div className="table__footer">
          {children}
        </div>
      )}
    </div>
  );
};

export default Table;
