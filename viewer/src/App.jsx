import { useState, useEffect } from 'react';
import { useReportData } from './hooks/useReportData';
import AppHeader from './components/AppHeader';
import Sidebar from './components/Sidebar';
import MainPanel from './components/MainPanel';
import AllHistoryMatrix from './components/AllHistoryMatrix';

const DEFAULT_SOURCE = 'reports/compose_common_component/summary_daily/index.json';

/**
 * App - Root component. Manages data source selection, sidebar run lists,
 * Single Run dashboard, and the full category History Matrix view.
 */
export default function App() {
  const [sourcePath, setSourcePath] = useState(DEFAULT_SOURCE);
  const [viewAllHistory, setViewAllHistory] = useState(false);
  
  const {
    reportRuns,
    selectedRun,
    loading,
    error,
    loadSourceIndex,
    selectRun,
    clearSelectedRun,
  } = useReportData();

  // Load default source on mount
  useEffect(() => {
    loadSourceIndex(DEFAULT_SOURCE);
  }, [loadSourceIndex]);

  const handleSourceChange = (value) => {
    setSourcePath(value);
    setViewAllHistory(false);
    // Immediately load if not custom
    if (value !== 'custom') {
      loadSourceIndex(value);
    }
  };

  const handleLoadSource = (customPath) => {
    if (!customPath) {
      alert('불러올 JSON 파일 경로를 입력해주세요.');
      return;
    }
    setViewAllHistory(false);
    loadSourceIndex(customPath);
  };

  const getIntervalLabel = () => {
    if (sourcePath.includes('summary_daily')) return '일별';
    if (sourcePath.includes('summary_weekly')) return '주간별';
    if (sourcePath.includes('summary_monthly')) return '월간별';
    if (sourcePath.includes('summary_yearly')) return '연간별';
    return '';
  };

  const getCategoryDir = () => {
    const parts = sourcePath.split('/');
    parts.pop(); // Remove "index.json"
    return parts.join('/') || 'reports';
  };

  const handleHome = () => {
    setViewAllHistory(false);
    clearSelectedRun();
  };

  const handleSelectRun = (timestamp) => {
    setViewAllHistory(false);
    selectRun(timestamp);
  };

  return (
    <div className="flex flex-col h-full">
      <AppHeader
        onHome={handleHome}
        sourcePath={sourcePath}
        onSourceChange={handleSourceChange}
        onLoadSource={handleLoadSource}
      />

      <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 81px)' }}>
        <Sidebar
          reportRuns={reportRuns}
          selectedRun={selectedRun}
          loading={loading && reportRuns.length === 0}
          error={!selectedRun && error ? error : null}
          onSelectRun={handleSelectRun}
          intervalLabel={getIntervalLabel()}
          isMatrixActive={viewAllHistory}
          onViewAllHistory={() => setViewAllHistory(true)}
        />
        
        {viewAllHistory ? (
          <AllHistoryMatrix
            reportRuns={reportRuns}
            categoryDir={getCategoryDir()}
          />
        ) : (
          <MainPanel
            selectedRun={selectedRun}
            loading={loading && reportRuns.length > 0 && !selectedRun}
            error={selectedRun ? null : null}
          />
        )}
      </div>
    </div>
  );
}
