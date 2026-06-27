import { useState, useEffect } from 'react';
import { useReportData } from './hooks/useReportData';
import AppHeader from './components/AppHeader';
import Sidebar from './components/Sidebar';
import MainPanel from './components/MainPanel';

const DEFAULT_SOURCE = 'reports/summary_daily/index.json';

/**
 * App - Root component. Manages data source selection and wires
 * the header, sidebar, and main panel together.
 */
export default function App() {
  const [sourcePath, setSourcePath] = useState(DEFAULT_SOURCE);
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
    loadSourceIndex(customPath);
  };

  const handleHome = () => {
    clearSelectedRun();
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
          onSelectRun={selectRun}
        />
        <MainPanel
          selectedRun={selectedRun}
          loading={loading && reportRuns.length > 0 && !selectedRun}
          error={selectedRun ? null : null}
        />
      </div>
    </div>
  );
}
