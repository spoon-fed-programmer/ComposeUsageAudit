import { formatTimestamp } from '../RunCard';

export default function MatrixHeader({
  viewMode,
  reportRuns,
  onSelectRun,
  hoveredColIdx,
  setHoveredColIdx,
  t,
}) {
  return (
    <tr className="bg-[#080b11] border-b border-border">
      {viewMode === 'component' ? (
        <>
          <th className="sticky top-0 left-0 z-40 bg-[#080b11] px-4 py-3 font-semibold text-text-secondary border-r border-border w-[165px] min-w-[165px] max-w-[165px]">
            {t('file_name')}
          </th>
          <th className="sticky top-0 left-[165px] z-40 bg-[#080b11] px-4 py-3 font-semibold text-text-secondary border-r border-border w-[220px] min-w-[220px] max-w-[220px]">
            {t('component_name')}
          </th>
        </>
      ) : (
        <th className="sticky top-0 left-0 z-40 bg-[#080b11] px-4 py-3 font-semibold text-text-secondary border-r border-border w-[220px] min-w-[220px] max-w-[220px]">
          {t('col_module_name')}
        </th>
      )}
      {reportRuns.map((run, i) => (
        <th
          key={`${run.timestamp}-${i}`}
          onMouseEnter={() => setHoveredColIdx(i)}
          onMouseLeave={() => setHoveredColIdx(null)}
          className={[
            'sticky top-0 z-30 px-2 py-3 font-semibold text-accent border-r border-border text-center text-xs w-[90px] min-w-[90px] max-w-[90px] overflow-hidden text-ellipsis transition-colors duration-150',
            hoveredColIdx === i ? 'bg-[#12151b]' : 'bg-[#080b11]'
          ].join(' ')}
        >
          <button
            onClick={() => onSelectRun(run.timestamp)}
            className="hover:underline hover:text-accent-hover cursor-pointer bg-transparent border-0 p-0 text-accent font-semibold text-xs outline-none transition-colors duration-150"
          >
            {formatTimestamp(run.timestamp, t)}
          </button>
        </th>
      ))}
    </tr>
  );
}
