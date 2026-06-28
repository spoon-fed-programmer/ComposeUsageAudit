import { useI18n } from '../contexts/I18nContext';

/**
 * Custom hook that manages loading the report index JSON and
 * fetching the report details JSON for the selected run.
 */
export function useReportData() {
  const { t } = useI18n();
  const [reportRuns, setReportRuns] = useState([]);
  const [selectedRun, setSelectedRun] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeJsonPath, setActiveJsonPath] = useState('');

  const _fetchRunDetail = useCallback(async (run, jsonPath) => {
    const parts = jsonPath.split('/');
    parts.pop(); // Remove "index.json"
    const categoryDir = parts.join('/') || 'reports';

    // 1. Fetch report.json (for metadata/summary)
    const reportRes = await fetch(`${categoryDir}/${run.timestamp}/report.json?t=${Date.now()}`);
    if (!reportRes.ok) {
      throw new Error(t('fetch_failed') + ' (report.json)');
    }
    const reportData = await reportRes.json();

    // 2. Fetch index.json (for flat component list)
    const indexRes = await fetch(`${categoryDir}/${run.timestamp}/index.json?t=${Date.now()}`);
    if (!indexRes.ok) {
      throw new Error(t('fetch_failed') + ' (index.json)');
    }
    const components = await indexRes.json();

    // Construct unique files list from components list
    const files = [...new Set(components.map((c) => c.file))].sort();

    setSelectedRun({
      ...reportData,
      timestamp: run.timestamp,
      components,
      files,
      categoryDir,
    });
  }, []);

  /** Fetch and parse the index JSON file. */
  const loadSourceIndex = useCallback(async (jsonPath, defaultTimestamp = null) => {
    setLoading(true);
    setError(null);
    setReportRuns([]);
    setSelectedRun(null);
    setActiveJsonPath(jsonPath);

    try {
      const res = await fetch(`${jsonPath}?t=${Date.now()}`);
      if (!res.ok) {
        throw new Error(`${t('fetch_failed')} (HTTP ${res.status})`);
      }
      const data = await res.json();
      
      let runs = [];
      if (Array.isArray(data)) {
        runs = data;
      } else if (data && Array.isArray(data.runs)) {
        runs = data.runs;
      } else {
        throw new Error(t('no_reports_found'));
      }
      
      if (runs.length === 0) {
        throw new Error(t('no_reports_found'));
      }
      setReportRuns(runs);

      // Auto-select the specified run or default to the first one
      const runToSelect = defaultTimestamp
        ? (runs.find(r => r.timestamp === defaultTimestamp) || runs[0])
        : runs[0];
      await _fetchRunDetail(runToSelect, jsonPath);
    } catch (err) {
      setError(_friendlyError(err, t));
    } finally {
      setLoading(false);
    }
  }, [_fetchRunDetail, t]);

  /** Select a run by timestamp */
  const selectRun = useCallback(
    async (timestamp) => {
      const run = reportRuns.find((r) => r.timestamp === timestamp);
      if (!run) return;
      setLoading(true);
      setError(null);
      try {
        await _fetchRunDetail(run, activeJsonPath);
      } catch (err) {
        setError(_friendlyError(err, t));
      } finally {
        setLoading(false);
      }
    },
    [reportRuns, activeJsonPath, _fetchRunDetail, t]
  );

  const clearSelectedRun = useCallback(() => setSelectedRun(null), []);

  return { reportRuns, selectedRun, loading, error, loadSourceIndex, selectRun, clearSelectedRun };
}

function _friendlyError(err, t) {
  if (window.location.protocol === 'file:') {
    return t('cors_warning');
  }
  return err.message;
}
