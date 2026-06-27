/**
 * ComponentsTable - Sortable data table for component overview.
 *
 * @param {object[]} props.components    - Array of { file, name, count }
 * @param {string}   props.sortCol       - 'file' | 'name' | 'count' | 'status'
 * @param {'asc'|'desc'} props.sortDir
 * @param {Function} props.onSort        - Called with column id string
 * @param {Function} props.onNavigate    - Called with file name when component link clicked
 */
export default function ComponentsTable({ components, sortCol, sortDir, onSort, onNavigate }) {
  const arrow = (col) =>
    sortCol === col ? (sortDir === 'asc' ? ' ▲' : ' ▼') : '';

  const columns = [
    { id: 'file',   label: '공통 파일',  align: 'left' },
    { id: 'name',   label: '컴포넌트명', align: 'left' },
    { id: 'count',  label: '참조 수',    align: 'right' },
    { id: 'status', label: '상태',       align: 'center', width: 120 },
  ];

  return (
    <div className="bg-panel border border-border rounded-lg overflow-hidden">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.id}
                onClick={() => onSort(col.id)}
                style={{ textAlign: col.align, width: col.width }}
                className="bg-[rgba(17,22,34,0.8)] text-text-secondary text-sm font-semibold px-6 py-4 border-b border-border cursor-pointer select-none hover:text-text-primary transition-colors"
              >
                {col.label}{arrow(col.id)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {components.length === 0 ? (
            <tr>
              <td colSpan={4} className="text-center text-text-muted px-6 py-8">
                조건에 맞는 컴포넌트가 없습니다.
              </td>
            </tr>
          ) : (
            components.map((c, idx) => {
              const isUnused = c.count === 0;
              return (
                <tr key={`${c.file}-${c.name}-${idx}`} className="hover:bg-white/[0.015] transition-colors border-b border-border last:border-0">
                  <td className="px-6 py-4 text-sm">
                    <span className="bg-white/5 border border-border text-text-secondary text-xs px-2 py-1 rounded-sm font-mono">
                      {c.file}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={() => onNavigate(c.file)}
                      className="text-text-primary font-semibold cursor-pointer bg-transparent border-0 p-0 transition-colors hover:text-accent hover:underline"
                    >
                      {c.name}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm text-right">
                    <span className={`font-mono font-bold text-sm ${isUnused ? 'text-text-muted' : 'text-success'}`}>
                      {c.count}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-center">
                    <span className={[
                      'text-[11px] font-semibold px-2 py-1 rounded-full uppercase inline-block border',
                      isUnused
                        ? 'bg-[rgba(100,116,139,0.1)] text-text-secondary border-[rgba(100,116,139,0.2)]'
                        : 'bg-success-glow text-success border-[rgba(16,185,129,0.2)]',
                    ].join(' ')}>
                      {isUnused ? 'unused' : 'active'}
                    </span>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
