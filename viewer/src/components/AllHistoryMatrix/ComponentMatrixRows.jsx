import { Fragment } from 'react';

export default function ComponentMatrixRows({
  uniqueFiles,
  componentsByFile,
  reportRuns,
  matrixData,
  hoveredColIdx,
  setHoveredColIdx,
  onNavigateFile,
  t,
}) {
  return (
    <>
      {uniqueFiles.map((file) => {
        const fileComponents = componentsByFile[file] || [];
        const rowSpanVal = fileComponents.length + 1;

        return (
          <Fragment key={file}>
            {/* File Subtotal Row */}
            <tr className="border-b border-border bg-white/[0.02] hover:bg-white/[0.035] font-semibold text-accent/90">
              <td
                rowSpan={rowSpanVal}
                className="sticky left-0 z-20 bg-[#080b11] font-sans font-semibold text-text-secondary px-4 py-2.5 border-r border-border w-[165px] min-w-[165px] max-w-[165px] align-middle overflow-hidden text-ellipsis shadow-[4px_0_10px_rgba(0,0,0,0.15)]"
              >
                <button
                  onClick={() => onNavigateFile(file)}
                  className="hover:underline hover:text-text-primary cursor-pointer bg-transparent border-0 p-0 text-text-secondary font-semibold text-left w-full outline-none block truncate transition-colors duration-150"
                  title={file}
                >
                  {file}
                </button>
              </td>
              <td className="sticky left-[165px] z-20 bg-[#0d1017] font-sans font-bold text-accent/80 px-4 py-2.5 border-r border-border w-[220px] min-w-[220px] max-w-[220px] overflow-hidden text-ellipsis shadow-[4px_0_10px_rgba(0,0,0,0.15)] border-l">
                {t('file_subtotal')}
              </td>
              {reportRuns.map((run, runIdx) => {
                const currentRunData = matrixData.find((d) => d.timestamp === run.timestamp);
                const fileRefs = currentRunData
                  ? currentRunData.components
                      .filter((rc) => rc.file === file)
                      .reduce((sum, rc) => sum + rc.count, 0)
                  : 0;

                let trendSpan = <span className="text-accent/90">{fileRefs.toLocaleString()}</span>;

                const nextRun = reportRuns[runIdx + 1];
                if (nextRun) {
                  const nextRunData = matrixData.find((d) => d.timestamp === nextRun.timestamp);
                  const prevFileRefs = nextRunData
                    ? nextRunData.components
                        .filter((rc) => rc.file === file)
                        .reduce((sum, rc) => sum + rc.count, 0)
                    : 0;

                  if (fileRefs > prevFileRefs) {
                    trendSpan = (
                      <span className="text-accent/90">
                        {fileRefs.toLocaleString()}{' '}
                        <span className="text-success">(+{(fileRefs - prevFileRefs).toLocaleString()})</span>
                      </span>
                    );
                  } else if (fileRefs < prevFileRefs) {
                    trendSpan = (
                      <span className="text-accent/90">
                        {fileRefs.toLocaleString()}{' '}
                        <span className="text-danger">(-{(prevFileRefs - fileRefs).toLocaleString()})</span>
                      </span>
                    );
                  }
                }

                const isHovered = hoveredColIdx === runIdx;
                return (
                  <td
                    key={`subtotal-${file}-${run.timestamp}`}
                    onMouseEnter={() => setHoveredColIdx(runIdx)}
                    onMouseLeave={() => setHoveredColIdx(null)}
                    className={[
                      'px-2 py-2.5 border-r border-border text-center w-[90px] min-w-[90px] max-w-[90px] overflow-hidden text-ellipsis transition-colors duration-150',
                      isHovered ? 'bg-white/[0.02]' : ''
                    ].join(' ')}
                  >
                    {trendSpan}
                  </td>
                );
              })}
            </tr>

            {/* Component Rows */}
            {fileComponents.map((c, compIdx) => (
              <tr
                key={`${c.file}-${c.name}-${compIdx}`}
                className="hover:bg-white/[0.015] border-b border-border last:border-0"
              >
                <td className="sticky left-[165px] z-20 bg-[#080b11] font-sans font-bold text-white px-4 py-2.5 border-r border-border w-[220px] min-w-[220px] max-w-[220px] overflow-hidden text-ellipsis shadow-[4px_0_10px_rgba(0,0,0,0.15)] border-l">
                  <button
                    onClick={() => onNavigateFile(c.file)}
                    className="hover:underline hover:text-accent cursor-pointer bg-transparent border-0 p-0 text-white font-bold text-left w-full outline-none block truncate transition-colors duration-150"
                    title={c.name}
                  >
                    {c.name}
                  </button>
                </td>

                {reportRuns.map((run, runIdx) => {
                  const currentRunData = matrixData.find((d) => d.timestamp === run.timestamp);
                  const countMap = {};
                  if (currentRunData) {
                    currentRunData.components.forEach((rc) => {
                      countMap[`${rc.file}::${rc.name}`] = rc.count;
                    });
                  }

                  const count = countMap[`${c.file}::${c.name}`];
                  const hasValue = count !== undefined;
                  const isUnused = count === 0;

                  let trendSpan = (
                    <span className={hasValue ? (isUnused ? 'text-text-muted/60' : 'text-white') : 'text-text-muted/40 font-normal'}>
                      {hasValue ? count.toLocaleString() : '-'}
                    </span>
                  );
 
                  if (hasValue && !isUnused) {
                    const nextRun = reportRuns[runIdx + 1];
                    if (nextRun) {
                      const nextRunData = matrixData.find((d) => d.timestamp === nextRun.timestamp);
                      const prevCountMap = {};
                      if (nextRunData) {
                        nextRunData.components.forEach((nc) => {
                          prevCountMap[`${nc.file}::${nc.name}`] = nc.count;
                        });
                      }
                      const prevCount = prevCountMap[`${c.file}::${c.name}`];
                      if (prevCount !== undefined) {
                        if (count > prevCount) {
                          trendSpan = (
                            <span className="text-white">
                              {count.toLocaleString()}{' '}
                              <span className="text-success">(+{(count - prevCount).toLocaleString()})</span>
                            </span>
                          );
                        } else if (count < prevCount) {
                          trendSpan = (
                            <span className="text-white">
                              {count.toLocaleString()}{' '}
                              <span className="text-danger">(-{(prevCount - count).toLocaleString()})</span>
                            </span>
                          );
                        }
                      }
                    }
                  }

                  const isHovered = hoveredColIdx === runIdx;
                  return (
                    <td
                      key={`${run.timestamp}-${compIdx}`}
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
          </Fragment>
        );
      })}
    </>
  );
}
