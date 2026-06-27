import { useEffect, useState, useMemo } from 'react';
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

  // Calculate rowSpan offsets for the file column
  const rowSpans = useMemo(() => {
    const spans = new Array(uniqueComponents.length).fill(0);
    let currentFile = null;
    let startIndex = 0;

    uniqueComponents.forEach((c, idx) => {
      if (c.file !== currentFile) {
        if (currentFile !== null) {
          spans[startIndex] = idx - startIndex;
        }
        currentFile = c.file;
        startIndex = idx;
      }
    });
    if (currentFile !== null) {
      spans[startIndex] = uniqueComponents.length - startIndex;
    }
    return spans;
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
        <table className="border-collapse text-left text-[11px] font-mono whitespace-nowrap min-w-full">
          <thead>
            {/* Header Row: Components Meta Columns + Run Dates */}
            <tr className="bg-[#080b11] border-b border-border">
              <th className="sticky top-0 left-0 z-40 bg-[#080b11] px-4 py-3 font-semibold text-text-secondary border-r border-border w-[150px] min-w-[150px] max-w-[150px]">
                파일명
              </th>
              <th className="sticky top-0 left-[150px] z-40 bg-[#080b11] px-4 py-3 font-semibold text-text-secondary border-r border-border w-[200px] min-w-[200px] max-w-[200px]">
                컴포넌트명
              </th>
              {matrixData.map((run, i) => (
                <th
                  key={`${run.timestamp}-${i}`}
                  onMouseEnter={() => setHoveredColIdx(i)}
                  onMouseLeave={() => setHoveredColIdx(null)}
                  className={[
                    'sticky top-0 z-30 px-2 py-3 font-semibold text-accent border-r border-border text-center text-xs w-[110px] min-w-[110px] max-w-[110px] overflow-hidden text-ellipsis transition-colors duration-150',
                    hoveredColIdx === i ? 'bg-white/[0.04]' : 'bg-[#080b11]'
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
              <td className="sticky left-0 z-20 bg-[#080b11] font-sans font-bold text-accent px-4 py-3 border-r border-border w-[150px] min-w-[150px] max-w-[150px] shadow-[4px_0_10px_rgba(0,0,0,0.15)]">
                합계
              </td>
              <td className="sticky left-[150px] z-20 bg-[#080b11] font-sans font-bold text-accent px-4 py-3 border-r border-border w-[200px] min-w-[200px] max-w-[200px] shadow-[4px_0_10px_rgba(0,0,0,0.15)] border-l">
                총 사용 참조 횟수
              </td>
              {matrixData.map((run, runIdx) => {
                const totalRefs = run.components.reduce((sum, rc) => sum + rc.count, 0);
                
                let trendClass = 'text-white';
                let diffText = '';
                
                const nextRun = matrixData[runIdx + 1];
                if (nextRun) {
                  const prevTotalRefs = nextRun.components.reduce((sum, rc) => sum + rc.count, 0);
                  if (totalRefs > prevTotalRefs) {
                    trendClass = 'text-success';
                    diffText = ` (+${totalRefs - prevTotalRefs})`;
                  } else if (totalRefs < prevTotalRefs) {
                    trendClass = 'text-danger';
                    diffText = ` (-${prevTotalRefs - totalRefs})`;
                  }
                }
                
                const isHovered = hoveredColIdx === runIdx;
                return (
                  <td
                    key={`total-refs-${run.timestamp}`}
                    onMouseEnter={() => setHoveredColIdx(runIdx)}
                    onMouseLeave={() => setHoveredColIdx(null)}
                    className={[
                      `px-2 py-3 border-r border-border text-center font-extrabold w-[110px] min-w-[110px] max-w-[110px] overflow-hidden text-ellipsis transition-colors duration-150 ${trendClass}`,
                      isHovered ? 'bg-white/[0.02]' : ''
                    ].join(' ')}
                  >
                    {totalRefs}회{diffText}
                  </td>
                );
              })}
            </tr>

            {uniqueComponents.map((c, compIdx) => {
              const fileSpan = rowSpans[compIdx];
              return (
                <tr
                  key={`${c.file}-${c.name}-${compIdx}`}
                  className="hover:bg-white/[0.015] border-b border-border last:border-0"
                >
                  {/* File Name Column (sticky left-0) */}
                  {fileSpan > 0 && (
                    <td
                      rowSpan={fileSpan}
                      className="sticky left-0 z-20 bg-[#080b11] font-sans font-semibold text-text-secondary px-4 py-2.5 border-r border-border w-[150px] min-w-[150px] max-w-[150px] align-middle overflow-hidden text-ellipsis shadow-[4px_0_10px_rgba(0,0,0,0.15)]"
                    >
                      {c.file}
                    </td>
                  )}

                  {/* Component Name Column (sticky left-150px) */}
                  <td className="sticky left-[150px] z-20 bg-[#080b11] font-sans font-bold text-white px-4 py-2.5 border-r border-border w-[200px] min-w-[200px] max-w-[200px] overflow-hidden text-ellipsis shadow-[4px_0_10px_rgba(0,0,0,0.15)] border-l">
                    {c.name}
                  </td>

                  {/* Date Cells */}
                  {matrixData.map((run, runIdx) => {
                    // Create lookup maps for current run and the next (older) run
                    const countMap = {};
                    run.components.forEach((rc) => {
                      countMap[`${rc.file}::${rc.name}`] = rc.count;
                    });

                    const count = countMap[`${c.file}::${c.name}`];
                    const hasValue = count !== undefined;
                    const isUnused = count === 0;

                    let trendClass = 'text-white';
                    let diffText = '';

                    if (hasValue) {
                      if (isUnused) {
                        trendClass = 'text-text-muted/60';
                      } else {
                        // Compare current run with next run (older run, so runIdx + 1)
                        const nextRun = matrixData[runIdx + 1];
                        if (nextRun) {
                          const prevCountMap = {};
                          nextRun.components.forEach((nc) => {
                            prevCountMap[`${nc.file}::${nc.name}`] = nc.count;
                          });
                          const prevCount = prevCountMap[`${c.file}::${c.name}`];
                          if (prevCount !== undefined) {
                            if (count > prevCount) {
                              trendClass = 'text-success';
                              diffText = ` (+${count - prevCount})`;
                            } else if (count < prevCount) {
                              trendClass = 'text-danger';
                              diffText = ` (-${prevCount - count})`;
                            }
                          }
                        }
                      }
                    } else {
                      trendClass = 'text-text-muted/40 font-normal';
                    }

                    const isHovered = hoveredColIdx === runIdx;
                    return (
                      <td
                        key={`${run.timestamp}-${compIdx}`}
                        onMouseEnter={() => setHoveredColIdx(runIdx)}
                        onMouseLeave={() => setHoveredColIdx(null)}
                        className={[
                          `px-2 py-2 border-r border-border text-center font-bold w-[110px] min-w-[110px] max-w-[110px] overflow-hidden text-ellipsis transition-colors duration-150 ${trendClass}`,
                          isHovered ? 'bg-white/[0.02]' : ''
                        ].join(' ')}
                      >
                        {hasValue ? `${count}회${diffText}` : '-'}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
