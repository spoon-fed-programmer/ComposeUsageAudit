import { useState, useEffect, useRef } from 'react';
import { useReportData } from './hooks/useReportData';
import AppHeader from './components/AppHeader';
import Sidebar from './components/Sidebar';
import MainPanel from './components/MainPanel';
import AllHistoryMatrix from './components/AllHistoryMatrix';

const DEFAULT_SOURCE = 'reports/compose_common_component/summary_daily/index.json';

const getIntervalName = (sourcePath) => {
  if (sourcePath.includes('summary_weekly')) return 'weekly';
  if (sourcePath.includes('summary_monthly')) return 'monthly';
  if (sourcePath.includes('summary_yearly')) return 'yearly';
  return 'daily';
};

const parseHash = (hash) => {
  const path = hash.replace(/^#\/?/, '');
  if (!path) return null;

  const parts = path.split('/');
  const interval = parts[0] || 'daily';
  
  let sourcePath = 'reports/compose_common_component/summary_daily/index.json';
  if (interval === 'weekly') sourcePath = 'reports/compose_common_component/summary_weekly/index.json';
  else if (interval === 'monthly') sourcePath = 'reports/compose_common_component/summary_monthly/index.json';
  else if (interval === 'yearly') sourcePath = 'reports/compose_common_component/summary_yearly/index.json';

  const viewType = parts[1]; // "matrix" or "run"
  if (viewType === 'matrix') {
    return {
      sourcePath,
      viewAllHistory: true,
      selectedRunTimestamp: null,
      activeTab: 'overview',
      navigatedFile: null,
    };
  }

  if (viewType === 'run') {
    const timestamp = parts[2] || null;
    const tab = parts[3] || 'overview'; // "overview" or "files"
    const file = parts[4] ? decodeURIComponent(parts[4]) : null;
    return {
      sourcePath,
      viewAllHistory: false,
      selectedRunTimestamp: timestamp,
      activeTab: tab === 'files' ? 'files' : 'overview',
      navigatedFile: file,
    };
  }

  return null;
};

const getHashFromState = (sourcePath, viewAllHistory, selectedRunTimestamp, activeTab, navigatedFile) => {
  let interval = getIntervalName(sourcePath);

  if (viewAllHistory) {
    return `#/${interval}/matrix`;
  }

  if (!selectedRunTimestamp) {
    return `#/${interval}/matrix`;
  }

  let hash = `#/${interval}/run/${selectedRunTimestamp}`;
  if (activeTab === 'files') {
    hash += '/files';
    if (navigatedFile) {
      hash += `/${encodeURIComponent(navigatedFile)}`;
    }
  } else {
    hash += '/overview';
  }
  return hash;
};

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
