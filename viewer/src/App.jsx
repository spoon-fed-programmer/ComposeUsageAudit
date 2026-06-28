import { useState, useEffect, useRef } from 'react';
import { useReportData } from './hooks/useReportData';
import AppHeader from './components/AppHeader';
import Sidebar from './components/Sidebar';
import MainPanel from './components/MainPanel';
import AllHistoryMatrix from './components/AllHistoryMatrix/AllHistoryMatrix';
import { parseHash, getHashFromState, getIntervalName } from './utils/router';

const DEFAULT_SOURCE = 'reports/compose_common_component/summary_daily/index.json';

/**
 * App - Root component. Manages data source selection, sidebar run lists,
 * Single Run dashboard, and the full category History Matrix view.
 */
export default function App() {
  // Parse initial hash or fallback
  const initialHashState = parseHash(window.location.hash) || {
    sourcePath: DEFAULT_SOURCE,
    viewAllHistory: true,
    selectedRunTimestamp: null,
    activeTab: 'overview',
    navigatedFile: null,
  };

  const [sourcePath, setSourcePath] = useState(initialHashState.sourcePath);
  const [viewAllHistory, setViewAllHistory] = useState(initialHashState.viewAllHistory);
  const [activeTab, setActiveTab] = useState(initialHashState.activeTab);
  const [navigatedFile, setNavigatedFile] = useState(initialHashState.navigatedFile);
  
  const {
    reportRuns,
    selectedRun,
    loading,
    error,
    loadSourceIndex,
    selectRun,
  } = useReportData();

  const loadedSourceRef = useRef(null);
  const loadedRunRef = useRef(null);

  // Sync state from hash when URL changes
  useEffect(() => {
    const syncStateFromHash = async () => {
      const parsed = parseHash(window.location.hash);
      if (!parsed) {
        window.location.hash = '#/daily/matrix';
        return;
      }

      setSourcePath(parsed.sourcePath);
      setViewAllHistory(parsed.viewAllHistory);
      setActiveTab(parsed.activeTab);
      setNavigatedFile(parsed.navigatedFile);

      let runTimestamp = parsed.selectedRunTimestamp;
      if (runTimestamp === 'latest') {
        runTimestamp = null; // Auto-select runs[0]
      }

      if (loadedSourceRef.current !== parsed.sourcePath) {
        loadedSourceRef.current = parsed.sourcePath;
        loadedRunRef.current = runTimestamp;
        await loadSourceIndex(parsed.sourcePath, runTimestamp);
      } else if (runTimestamp && loadedRunRef.current !== runTimestamp) {
        loadedRunRef.current = runTimestamp;
        await selectRun(runTimestamp);
      } else if (!runTimestamp) {
        loadedRunRef.current = null;
      }
    };

    syncStateFromHash();

    window.addEventListener('hashchange', syncStateFromHash);
    return () => {
      window.removeEventListener('hashchange', syncStateFromHash);
    };
  }, [loadSourceIndex, selectRun]);

  // Sync state changes back to hash
  useEffect(() => {
    if (!selectedRun && !viewAllHistory) return;
    const currentHash = getHashFromState(
      sourcePath,
      viewAllHistory,
      selectedRun?.timestamp,
      activeTab,
      navigatedFile
    );
    if (window.location.hash !== currentHash) {
      window.location.hash = currentHash;
    }
  }, [sourcePath, viewAllHistory, selectedRun, activeTab, navigatedFile]);

  const handleSourceChange = (value) => {
    const interval = getIntervalName(value);
    window.location.hash = `#/${interval}/matrix`;
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
    window.location.hash = '#/daily/run/latest';
  };

  const handleSelectRun = (timestamp) => {
    const interval = getIntervalName(sourcePath);
    window.location.hash = `#/${interval}/run/${timestamp}/overview`;
  };

  const handleTabSwitch = (tab) => {
    const interval = getIntervalName(sourcePath);
    const runTimestamp = selectedRun?.timestamp || 'latest';
    if (tab === 'files') {
      window.location.hash = `#/${interval}/run/${runTimestamp}/files`;
    } else {
      window.location.hash = `#/${interval}/run/${runTimestamp}/overview`;
    }
  };

  const handleNavigateFile = (fileName) => {
    const interval = getIntervalName(sourcePath);
    const runTimestamp = selectedRun?.timestamp || 'latest';
    window.location.hash = `#/${interval}/run/${runTimestamp}/files/${encodeURIComponent(fileName)}`;
  };

  return (
    <div className="flex flex-col h-full">
      <AppHeader
        onHome={handleHome}
        total={selectedRun?.summary?.total_components}
        refs={selectedRun?.summary?.total_references}
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
          onViewAllHistory={() => {
            const interval = getIntervalName(sourcePath);
            window.location.hash = `#/${interval}/matrix`;
          }}
          sourcePath={sourcePath}
          onSourceChange={handleSourceChange}
        />
        
        {viewAllHistory ? (
          <AllHistoryMatrix
            reportRuns={reportRuns}
            categoryDir={getCategoryDir()}
            onSelectRun={handleSelectRun}
            onNavigateFile={handleNavigateFile}
          />
        ) : (
          <MainPanel
            selectedRun={selectedRun}
            loading={loading && reportRuns.length > 0 && !selectedRun}
            error={selectedRun ? null : null}
            activeTab={activeTab}
            navigatedFile={navigatedFile}
            onTabSwitch={handleTabSwitch}
            onNavigateFile={handleNavigateFile}
          />
        )}
      </div>
    </div>
  );
}
