import { useEffect, useState, useMemo } from 'react';

/**
 * AllHistoryMatrix - Renders a pivot table of all components' reference counts
 * across all report runs for the selected category.
 *
 * @param {object}   props
 * @param {object[]} props.reportRuns - List of runs from index.json
 * @param {string}   props.categoryDir - Root path of the current report category
 */
export default function AllHistoryMatrix({ reportRuns, categoryDir }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [matrixData, setMatrixData] = useState([]);

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

  // Aggregate components and calculate spans
  const { uniqueComponents, filesHeader } = useMemo(() => {
    const compMap = {};
    matrixData.forEach((run) => {
      run.components.forEach((c) => {
        const key = `${c.file}::${c.name}`;
        if (!compMap[key]) {
          compMap[key] = { file: c.file, name: c.name };
        }
      });
    });

    const uniqueList = Object.values(compMap).sort((a, b) => {
      if (a.file !== b.file) return a.file.localeCompare(b.file);
      return a.name.localeCompare(b.name);
    });

    const headers = [];
    let currentFile = null;
    let currentSpan = 0;

    uniqueList.forEach((c) => {
      if (c.file !== currentFile) {
        if (currentFile !== null) {
          headers.push({ file: currentFile, colSpan: currentSpan });
        }
        currentFile = c.file;
        currentSpan = 1;
      } else {
        currentSpan++;
      }
    });
    if (currentFile !== null) {
      headers.push({ file: currentFile, colSpan: currentSpan });
    }

    return { uniqueComponents: uniqueList, filesHeader: headers };
  }, [matrixData]);

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
          모든 리포트 주기의 컴포넌트별 참조 횟수 변화를 한눈에 볼 수 있습니다.
        </p>
      </div>

      <div className="flex-1 border border-border bg-panel rounded-lg overflow-auto max-h-[calc(100vh-230px)]">
        <table className="border-collapse text-left text-[11px] font-mono whitespace-nowrap min-w-full">
          <thead>
            {/* Header Row 1: File Names */}
            <tr className="bg-[rgba(17,22,34,0.95)] backdrop-blur-panel border-b border-border">
              <th className="sticky top-0 left-0 z-40 bg-[rgba(17,22,34,0.95)] px-4 py-3 font-semibold text-text-secondary border-r border-border min-w-[160px]">
                분석 시간
              </th>
              {filesHeader.map((h, i) => (
                <th
                  key={`${h.file}-${i}`}
                  colSpan={h.colSpan}
                  className="sticky top-0 z-30 px-4 py-3 font-semibold text-accent border-r border-border text-center text-xs"
                >
                  {h.file}
                </th>
              ))}
            </tr>
            {/* Header Row 2: Component Names */}
            <tr className="bg-[rgba(17,22,34,0.95)] border-b border-border">
              <th className="sticky top-0 left-0 z-40 bg-[rgba(17,22,34,0.95)] px-4 py-2 border-r border-border">
                {/* Blank under Date */}
              </th>
              {uniqueComponents.map((c, i) => (
                <th
                  key={`${c.file}-${c.name}-${i}`}
                  className="sticky top-0 z-30 px-3 py-2 font-bold text-white border-r border-border text-center"
                >
                  {c.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrixData.map((run, runIdx) => {
              // Create map for fast lookup of this run's components
              const countMap = {};
              run.components.forEach((c) => {
                countMap[`${c.file}::${c.name}`] = c.count;
              });

              // Create map for the next (older) run once
              const nextRun = matrixData[runIdx + 1];
              const prevCountMap = {};
              if (nextRun) {
                nextRun.components.forEach((c) => {
                  prevCountMap[`${c.file}::${c.name}`] = c.count;
                });
              }

              return (
                <tr
                  key={run.timestamp}
                  className="hover:bg-white/[0.015] border-b border-border last:border-0"
                >
                  {/* Sticky Date/Time Column */}
                  <td className="sticky left-0 z-20 bg-bg/95 font-sans font-semibold text-text-primary px-4 py-2.5 border-r border-border shadow-[4px_0_10px_rgba(0,0,0,0.3)]">
                    {run.date}
                  </td>
                  {uniqueComponents.map((c, compIdx) => {
                    const count = countMap[`${c.file}::${c.name}`];
                    const hasValue = count !== undefined;
                    const isUnused = count === 0;

                    let trendClass = 'text-white';
                    let diffText = '';

                    if (hasValue) {
                      if (isUnused) {
                        trendClass = 'text-text-muted/60';
                      } else {
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
                    } else {
                      trendClass = 'text-text-muted/40 font-normal';
                    }

                    return (
                      <td
                        key={`${c.file}-${c.name}-${compIdx}`}
                        className={`px-3 py-2.5 border-r border-border text-center font-bold ${trendClass}`}
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
