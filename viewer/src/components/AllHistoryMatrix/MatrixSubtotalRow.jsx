export default function MatrixSubtotalRow({
  viewMode,
  reportRuns,
  hoveredColIdx,
  setHoveredColIdx,
  t,
}) {
  return (
    <tr className="border-b border-border bg-white/[0.01] hover:bg-white/[0.025] font-bold">
      {viewMode === 'component' ? (
        <>
          <td className="sticky left-0 z-20 bg-[#080b11] font-sans font-bold text-accent px-4 py-3 border-r border-border w-[165px] min-w-[165px] max-w-[165px] shadow-[4px_0_10px_rgba(0,0,0,0.15)]">
            {t('subtotal')}
          </td>
          <td className="sticky left-[165px] z-20 bg-[#080b11] font-sans font-bold text-accent px-4 py-3 border-r border-border w-[220px] min-w-[220px] max-w-[220px] shadow-[4px_0_10px_rgba(0,0,0,0.15)] border-l">
            {t('total_use_ref_count')}
          </td>
        </>
      ) : (
        <td className="sticky left-0 z-20 bg-[#080b11] font-sans font-bold text-accent px-4 py-3 border-r border-border w-[220px] min-w-[220px] max-w-[220px] shadow-[4px_0_10px_rgba(0,0,0,0.15)]">
          {t('total_use_ref_count')}
        </td>
      )}
      {reportRuns.map((run, runIdx) => {
        const totalRefs = run.summary ? run.summary.total_references : 0;
        let trendSpan = <span className="text-white">{totalRefs}</span>;
        
        const nextRun = reportRuns[runIdx + 1];
        if (nextRun) {
          const prevTotalRefs = nextRun.summary ? nextRun.summary.total_references : 0;
          if (totalRefs > prevTotalRefs) {
            trendSpan = (
              <span className="text-white">
                {totalRefs}{' '}
                <span className="text-success">(+{totalRefs - prevTotalRefs})</span>
              </span>
            );
          } else if (totalRefs < prevTotalRefs) {
            trendSpan = (
              <span className="text-white">
                {totalRefs}{' '}
                <span className="text-danger">(-{prevTotalRefs - totalRefs})</span>
              </span>
            );
          }
        }
        
        const isHovered = hoveredColIdx === runIdx;
        return (
          <td
            key={`total-refs-${run.timestamp}`}
            onMouseEnter={() => setHoveredColIdx(runIdx)}
            onMouseLeave={() => setHoveredColIdx(null)}
            className={[
              'px-2 py-3 border-r border-border text-center font-extrabold w-[90px] min-w-[90px] max-w-[90px] overflow-hidden text-ellipsis transition-colors duration-150',
              isHovered ? 'bg-white/[0.02]' : ''
            ].join(' ')}
          >
            {trendSpan}
          </td>
        );
      })}
    </tr>
  );
}
