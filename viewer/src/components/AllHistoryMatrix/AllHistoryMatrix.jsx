import { useState, useEffect, useMemo } from 'react';
import { useI18n } from '../../contexts/I18nContext';
import {
  getUniqueComponents,
  getUniqueFiles,
  getComponentsByFile,
  getUniqueModules
} from '../../utils/matrixHelper';

// Subcomponents import
import MatrixHeader from './MatrixHeader';
import MatrixSubtotalRow from './MatrixSubtotalRow';
import ComponentMatrixRows from './ComponentMatrixRows';
import ModuleMatrixRows from './ModuleMatrixRows';
import HistoryTrendChart from './HistoryTrendChart';

export default function AllHistoryMatrix({ reportRuns, categoryDir, onSelectRun, onNavigateFile }) {
  const { lang, t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [matrixData, setMatrixData] = useState([]);
  const [hoveredColIdx, setHoveredColIdx] = useState(null);
  const [viewMode, setViewMode] = useState('component'); // 'component' or 'module'

  useEffect(() => {
    if (reportRuns.length === 0 || !categoryDir) return;

    let isMounted = true;
    const loadAllDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const promises = reportRuns.map(async (run) => {
          const res = await fetch(`${categoryDir}/${run.timestamp}/index.json`);
          if (!res.ok) {
            throw new Error(`Failed to fetch index for run ${run.timestamp}`);
          }
          const details = await res.json();
          return {
            timestamp: run.timestamp,
            components: details
          };
        });
        const results = await Promise.all(promises);
        if (isMounted) {
          // Sort results matching original reportRuns order (descending by timestamp)
          results.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
          setMatrixData(results);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to fetch matrix data');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadAllDetails();

    return () => {
      isMounted = false;
    };
  }, [reportRuns, categoryDir]);

  // Compute values using helper functions
  const uniqueComponents = useMemo(() => getUniqueComponents(matrixData), [matrixData]);
  const uniqueFiles = useMemo(() => getUniqueFiles(uniqueComponents), [uniqueComponents]);
  const componentsByFile = useMemo(() => getComponentsByFile(uniqueComponents), [uniqueComponents]);
  const uniqueModules = useMemo(() => getUniqueModules(reportRuns), [reportRuns]);

  if (viewMode === 'component' && loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <div className="spinner" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] text-danger font-semibold gap-2">
        <span>⚠️ {t('matrix_error')}</span>
        <span className="text-xs text-text-secondary font-normal">{error}</span>
      </div>
    );
  }

  if (reportRuns.length === 0) {
    return null;
  }

  return (
    <div className="flex-1 p-10 flex flex-col gap-6 overflow-y-auto" style={{ height: 'calc(100vh - 81px)' }}>
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

      {/* Combined Horizontal Scroll Wrapper */}
      <div className="border border-border bg-panel rounded-lg overflow-x-auto w-full p-6 flex flex-col gap-6 custom-scrollbar">
        {/* Trend Chart */}
        {!loading && matrixData.length > 0 && (
          <HistoryTrendChart reportRuns={reportRuns} viewMode={viewMode} />
        )}

        <table className="w-max text-xs border-collapse font-mono relative">
          <thead>
            <MatrixHeader
              viewMode={viewMode}
              reportRuns={reportRuns}
              onSelectRun={onSelectRun}
              hoveredColIdx={hoveredColIdx}
              setHoveredColIdx={setHoveredColIdx}
              t={t}
            />
          </thead>
          <tbody>
            <MatrixSubtotalRow
              viewMode={viewMode}
              reportRuns={reportRuns}
              hoveredColIdx={hoveredColIdx}
              setHoveredColIdx={setHoveredColIdx}
              t={t}
            />

            {viewMode === 'component' && (
              <ComponentMatrixRows
                uniqueFiles={uniqueFiles}
                componentsByFile={componentsByFile}
                reportRuns={reportRuns}
                matrixData={matrixData}
                hoveredColIdx={hoveredColIdx}
                setHoveredColIdx={setHoveredColIdx}
                onNavigateFile={onNavigateFile}
                t={t}
              />
            )}

            {viewMode === 'module' && (
              <ModuleMatrixRows
                uniqueModules={uniqueModules}
                reportRuns={reportRuns}
                hoveredColIdx={hoveredColIdx}
                setHoveredColIdx={setHoveredColIdx}
              />
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
