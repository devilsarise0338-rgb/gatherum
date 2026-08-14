import React from 'react';

interface Column {
  key: string;
  header: string;
}

interface TableProps {
  columns: Column[];
  data: any[];
  onRowClick?: (row: any) => void;
}

export const Table: React.FC<TableProps> = ({ columns, data, onRowClick }) => {
  return (
    <div className="bg-surface border-4 border-grid-line shadow-[8px_8px_0_0_#2A2A2A] overflow-x-auto hide-scrollbar">
      <table className="w-full text-left font-body-md border-collapse">
        <thead className="bg-surface-dim">
          <tr className="border-b-4 border-grid-line font-label-caps text-on-surface-variant uppercase tracking-widest">
            {columns.map((col, idx) => (
              <th key={col.key} className={`p-4 ${idx !== columns.length - 1 ? 'border-r-2 border-grid-line' : ''}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIdx) => (
            <tr 
              key={rowIdx} 
              onClick={() => onRowClick && onRowClick(row)}
              className={`border-b-2 border-grid-line last:border-b-0 hover:bg-surface-bright transition-colors ${onRowClick ? 'cursor-pointer group' : ''}`}
            >
              {columns.map((col, colIdx) => (
                <td key={col.key} className={`p-4 ${colIdx !== columns.length - 1 ? 'border-r-2 border-grid-line' : ''}`}>
                  {row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
