import { useEffect, useState, useMemo, Fragment } from 'react';
import { formatTimestamp } from './RunCard';
import { useI18n } from '../contexts/I18nContext';

/**
 * AllHistoryMatrix - Renders a transposed pivot table of components (rows)
 * across all report runs (columns) for the selected category.
 *
 * @param {object}   props
 * @param {object[]} props.reportRuns - List of runs from index.json
 * @param {string}   props.categoryDir - Root path of the current report category
 */
export default function AllHistoryMatrix({ reportRuns, categoryDir, onSelectRun, onNavigateFile }) {
  const { lang, t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [matrixData, setMatrixData] = useState([]);
  const [hoveredColIdx, setHoveredColIdx] = useState(null);
  const [viewMode, setViewMode] = useState('component'); // 'component' or 'module'

  // Extract unique modules alphabetically
  const uniqueModules = useMemo(() => {
    const modulesSet = new Set();
    reportRuns.forEach((run) => {
      if (run.modules) {
        Object.keys(run.modules).forEach((mod) => {
          modulesSet.add(mod);
        });
      }
    });
    return [...modulesSet].sort((a, b) => {
      if (a === '') return -1;
      if (b === '') return 1;
      return a.localeCompare(b);
    });
  }, [reportRuns]);

  useEffect(() => {
    if (reportRuns.length === 0 || !categoryDir) return;

    const loadAllDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchPromises = reportRuns.map(async (run) => {
          const res = await fetch(`${categoryDir}/${run.timestamp}/index.json`);
          if (!res.ok) {
            throw new Error(t('matrix_error'));
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

  if (viewMode === 'component' && loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <div className="spinner" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-10 bg-panel border border-border rounded-lg m-10 text-danger leading-relaxed">
        <p className="font-semibold mb-3">{t('matrix_error')}</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (matrixData.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px] text-text-muted">
        {t('no_reports_found')}
      </div>
    );
  }

  return (
    <div className="flex-1 p-10 flex flex-col gap-6 overflow-hidden">
      <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h2 className="text-xl font-bold text-white mb-2">{t('view_all_history')}</h2>
          <p className="text-xs text-text-secondary">
            {lang === 'ko'
              ? '모든 리포트 주기의 컴포넌트 및 모듈별 참조 횟수 변화를 가로 흐름(과거 → 현재)으로 추적합니다.'
              : 'Track the reference count change of components or modules over all report cycles horizontally (Past → Present).'}
          </p>
        </div>

        {/* View Mode Switching Tabs */}
        <div className="flex bg-black/20 p-1 rounded-full border border-border/60 backdrop-blur-sm shadow-sm shrink-0">
          <button
            onClick={() => setViewMode('component')}
            className={[
              'px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border-0 outline-none select-none',
              viewMode === 'component'
                ? 'bg-accent text-white shadow-accent-sm font-bold'
                : 'bg-transparent text-text-secondary hover:text-text-primary',
            ].join(' ')}
          >
            {t('mode_component')}
          </button>
          <button
            onClick={() => setViewMode('module')}
            className={[
              'px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border-0 outline-none select-none',
              viewMode === 'module'
                ? 'bg-accent text-white shadow-accent-sm font-bold'
                : 'bg-transparent text-text-secondary hover:text-text-primary',
            ].join(' ')}
          >
            {t('mode_module')}
          </button>
        </div>
      </div>

      <div className="flex-1 border border-border bg-panel rounded-lg overflow-auto max-h-[calc(100vh-230px)]">
        <table className="border-collapse text-left text-[11px] font-mono whitespace-nowrap w-max">
          <thead>
            {/* Header Row: Columns + Run Dates */}
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
          </thead>
          <tbody>
            {/* Total References Summary Row */}
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

            {/* View Mode 1: Component Matrix */}
            {viewMode === 'component' && uniqueFiles.map((file) => {
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

                      let trendSpan = <span className="text-accent/90">{fileRefs}</span>;

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
                            {hasValue ? count : '-'}
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

            {/* View Mode 2: Module Matrix */}
            {viewMode === 'module' && uniqueModules.map((mod, idx) => (
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
          </tbody>
        </table>
      </div>
    </div>
  );
}
