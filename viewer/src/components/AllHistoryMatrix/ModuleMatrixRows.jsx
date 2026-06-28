export default function ModuleMatrixRows({
  uniqueModules,
  reportRuns,
  hoveredColIdx,
  setHoveredColIdx,
}) {
  return (
    <>
      {uniqueModules.map((mod, idx) => (
        <tr
          key={`module-${mod}-${idx}`}
          className="hover:bg-white/[0.015] border-b border-border last:border-0"
        >
          <td className="sticky left-0 z-20 bg-[#080b11] font-sans font-bold text-white px-4 py-2.5 border-r border-border w-[220px] min-w-[220px] max-w-[220px] overflow-hidden text-ellipsis shadow-[4px_0_10px_rgba(0,0,0,0.15)]">
            <span className="text-white font-bold" title={mod || '(root)'}>
              {mod || '(root)'}
            </span>
          </td>

          {reportRuns.map((run, runIdx) => {
            const count = run.modules ? (run.modules[mod] || 0) : 0;
            const hasValue = run.modules !== undefined;
            const isUnused = count === 0;

            let trendSpan = (
              <span className={hasValue ? (isUnused ? 'text-text-muted/60' : 'text-white') : 'text-text-muted/40 font-normal'}>
                {count}
              </span>
            );

            if (!isUnused) {
              const nextRun = reportRuns[runIdx + 1];
              if (nextRun) {
                const prevCount = nextRun.modules ? (nextRun.modules[mod] || 0) : 0;
                if (count > prevCount) {
                  trendSpan = (
                    <span className="text-white">
                      {count}{' '}
                      <span className="text-success">(+{count - prevCount})</span>
                    </span>
                  );
                } else if (count < prevCount) {
                  trendSpan = (
                    <span className="text-white">
                      {count}{' '}
                      <span className="text-danger">(-{prevCount - count})</span>
                    </span>
                  );
                }
              }
            }

            const isHovered = hoveredColIdx === runIdx;
            return (
              <td
                key={`${run.timestamp}-mod-${idx}`}
                onMouseEnter={() => setHoveredColIdx(runIdx)}
                onMouseLeave={() => setHoveredColIdx(null)}
                className={[
                  'px-2 py-2 border-r border-border text-center font-bold w-[90px] min-w-[90px] max-w-[90px] overflow-hidden text-ellipsis transition-colors duration-150',
                  isHovered ? 'bg-white/[0.02]' : ''
                ].join(' ')}
              >
                {trendSpan}
              </td>
            );
          })}
        </tr>
      ))}
    </>
  );
}
