import { useEffect, useState, useMemo, Fragment } from 'react';
import { formatTimestamp } from './RunCard';

/**
 * AllHistoryMatrix - Renders a transposed pivot table of components (rows)
 * across all report runs (columns) for the selected category.
 *
 * @param {object}   props
 * @param {object[]} props.reportRuns - List of runs from index.json
 * @param {string}   props.categoryDir - Root path of the current report category
 */
export default function AllHistoryMatrix({ reportRuns, categoryDir }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [matrixData, setMatrixData] = useState([]);
  const [hoveredColIdx, setHoveredColIdx] = useState(null);

  useEffect(() => {
    if (reportRuns.length === 0 || !categoryDir) return;

    const loadAllDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchPromises = reportRuns.map(async (run) => {
          const res = await fetch(`${categoryDir}/${run.timestamp}/index.json`);
          if (!res.ok) {
            throw new Error(`${run.timestamp} 데이터를 로드하지 못했습니다.`);
          }
          const compsList = await res.json();
          return {
            timestamp: run.timestamp,
            date: run.date,
            components: compsList,
          };
        });

        const results = await Promise.all(fetchPromises);
        setMatrixData(results);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadAllDetails();
  }, [reportRuns, categoryDir]);

  // Aggregate unique components and sort them by file, then by component name (ascending)
  const uniqueComponents = useMemo(() => {
    const compMap = {};
    matrixData.forEach((run) => {
      run.components.forEach((c) => {
        const key = `${c.file}::${c.name}`;
        if (!compMap[key]) {
          compMap[key] = { file: c.file, name: c.name };
        }
      });
    });

    return Object.values(compMap).sort((a, b) => {
      if (a.file !== b.file) return a.file.localeCompare(b.file);
      return a.name.localeCompare(b.name);
    });
  }, [matrixData]);

  // Extract unique files
  const uniqueFiles = useMemo(() => {
    const files = uniqueComponents.map((c) => c.file);
    return [...new Set(files)].sort();
  }, [uniqueComponents]);

  // Group components by file
  const componentsByFile = useMemo(() => {
    const groups = {};
    uniqueComponents.forEach((c) => {
      if (!groups[c.file]) {
        groups[c.file] = [];
      }
      groups[c.file].push(c);
    });
    return groups;
  }, [uniqueComponents]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <div className="spinner" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-10 bg-panel border border-border rounded-lg m-10 text-danger leading-relaxed">
        <p className="font-semibold mb-3">전체 이력 로드 실패</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (matrixData.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px] text-text-muted">
        조회된 전체 이력 데이터가 없습니다.
      </div>
    );
  }

  return (
    <div className="flex-1 p-10 flex flex-col gap-6 overflow-hidden">
      <div>
        <h2 className="text-xl font-bold text-white mb-2">전체 이력 매트릭스</h2>
        <p className="text-xs text-text-secondary">
          모든 리포트 주기의 컴포넌트별 참조 횟수 변화를 가로 흐름(과거 → 현재)으로 추적합니다.
        </p>
      </div>

      <div className="flex-1 border border-border bg-panel rounded-lg overflow-auto max-h-[calc(100vh-230px)]">
        <table className="border-collapse text-left text-[11px] font-mono whitespace-nowrap w-max">
          <thead>
            {/* Header Row: Components Meta Columns + Run Dates */}
            <tr className="bg-[#080b11] border-b border-border">
              <th className="sticky top-0 left-0 z-40 bg-[#080b11] px-4 py-3 font-semibold text-text-secondary border-r border-border w-[165px] min-w-[165px] max-w-[165px]">
                파일명
              </th>
              <th className="sticky top-0 left-[165px] z-40 bg-[#080b11] px-4 py-3 font-semibold text-text-secondary border-r border-border w-[220px] min-w-[220px] max-w-[220px]">
                컴포넌트명
              </th>
              {matrixData.map((run, i) => (
                <th
                  key={`${run.timestamp}-${i}`}
                  onMouseEnter={() => setHoveredColIdx(i)}
                  onMouseLeave={() => setHoveredColIdx(null)}
                  className={[
                    'sticky top-0 z-30 px-2 py-3 font-semibold text-accent border-r border-border text-center text-xs w-[90px] min-w-[90px] max-w-[90px] overflow-hidden text-ellipsis transition-colors duration-150',
                    hoveredColIdx === i ? 'bg-[#12151b]' : 'bg-[#080b11]'
                  ].join(' ')}
                >
                  {formatTimestamp(run.timestamp)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Total References Summary Row */}
            <tr className="border-b border-border bg-white/[0.01] hover:bg-white/[0.025] font-bold">
              <td className="sticky left-0 z-20 bg-[#080b11] font-sans font-bold text-accent px-4 py-3 border-r border-border w-[165px] min-w-[165px] max-w-[165px] shadow-[4px_0_10px_rgba(0,0,0,0.15)]">
                합계
              </td>
              <td className="sticky left-[165px] z-20 bg-[#080b11] font-sans font-bold text-accent px-4 py-3 border-r border-border w-[220px] min-w-[220px] max-w-[220px] shadow-[4px_0_10px_rgba(0,0,0,0.15)] border-l">
                총 사용 참조 횟수
              </td>
              {matrixData.map((run, runIdx) => {
                const totalRefs = run.components.reduce((sum, rc) => sum + rc.count, 0);
                
                let trendSpan = <span className="text-white">{totalRefs}</span>;
                
                const nextRun = matrixData[runIdx + 1];
                if (nextRun) {
                  const prevTotalRefs = nextRun.components.reduce((sum, rc) => sum + rc.count, 0);
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

            {/* Grouped by File: Subtotal Row + Component Rows */}
            {uniqueFiles.map((file) => {
              const fileComponents = componentsByFile[file] || [];
              const rowSpanVal = fileComponents.length + 1;

              return (
                <Fragment key={file}>
                  {/* 1. Subtotal Row for the File */}
                  <tr className="border-b border-border bg-white/[0.02] hover:bg-white/[0.035] font-semibold text-accent/90">
                    <td
                      rowSpan={rowSpanVal}
                      className="sticky left-0 z-20 bg-[#080b11] font-sans font-semibold text-text-secondary px-4 py-2.5 border-r border-border w-[165px] min-w-[165px] max-w-[165px] align-middle overflow-hidden text-ellipsis shadow-[4px_0_10px_rgba(0,0,0,0.15)]"
                    >
                      {file}
                    </td>
                    <td className="sticky left-[165px] z-20 bg-[#0d1017] font-sans font-bold text-accent/80 px-4 py-2.5 border-r border-border w-[220px] min-w-[220px] max-w-[220px] overflow-hidden text-ellipsis shadow-[4px_0_10px_rgba(0,0,0,0.15)] border-l">
                      파일 합계
                    </td>
                    {matrixData.map((run, runIdx) => {
                      const fileRefs = run.components
                        .filter((rc) => rc.file === file)
                        .reduce((sum, rc) => sum + rc.count, 0);

                      let trendSpan = <span className="text-accent/90">{fileRefs}</span>;

                      const nextRun = matrixData[runIdx + 1];
                      if (nextRun) {
                        const prevFileRefs = nextRun.components
                          .filter((rc) => rc.file === file)
                          .reduce((sum, rc) => sum + rc.count, 0);
                        if (fileRefs > prevFileRefs) {
                          trendSpan = (
                            <span className="text-accent/90">
                              {fileRefs}{' '}
                              <span className="text-success">(+{fileRefs - prevFileRefs})</span>
                            </span>
                          );
                        } else if (fileRefs < prevFileRefs) {
                          trendSpan = (
                            <span className="text-accent/90">
                              {fileRefs}{' '}
                              <span className="text-danger">(-{prevFileRefs - fileRefs})</span>
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

                  {/* 2. Component Rows */}
                  {fileComponents.map((c, compIdx) => (
                    <tr
                      key={`${c.file}-${c.name}-${compIdx}`}
                      className="hover:bg-white/[0.015] border-b border-border last:border-0"
                    >
                      {/* Component Name Column */}
                      <td className="sticky left-[165px] z-20 bg-[#080b11] font-sans font-bold text-white px-4 py-2.5 border-r border-border w-[220px] min-w-[220px] max-w-[220px] overflow-hidden text-ellipsis shadow-[4px_0_10px_rgba(0,0,0,0.15)] border-l">
                        {c.name}
                      </td>

                      {/* Date Cells */}
                      {matrixData.map((run, runIdx) => {
                        const countMap = {};
                        run.components.forEach((rc) => {
                          countMap[`${rc.file}::${rc.name}`] = rc.count;
                        });

                        const count = countMap[`${c.file}::${c.name}`];
                        const hasValue = count !== undefined;
                        const isUnused = count === 0;

                        let trendSpan = (
                          <span className={hasValue ? (isUnused ? 'text-text-muted/60' : 'text-white') : 'text-text-muted/40 font-normal'}>
                            {hasValue ? count : '-'}
                          </span>
                        );

                        if (hasValue && !isUnused) {
                          const nextRun = matrixData[runIdx + 1];
                          if (nextRun) {
                            const prevCountMap = {};
                            nextRun.components.forEach((nc) => {
                              prevCountMap[`${nc.file}::${nc.name}`] = nc.count;
                            });
                            const prevCount = prevCountMap[`${c.file}::${c.name}`];
                            if (prevCount !== undefined) {
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
          </tbody>
        </table>
      </div>
    </div>
  );
}
