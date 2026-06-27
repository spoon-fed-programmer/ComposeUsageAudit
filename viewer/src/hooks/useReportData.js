import { useState, useCallback } from 'react';

/**
 * Custom hook that manages loading the report index JSON and
 * fetching the report details JSON for the selected run.
 */
export function useReportData() {
  const [reportRuns, setReportRuns] = useState([]);
  const [selectedRun, setSelectedRun] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeJsonPath, setActiveJsonPath] = useState('');

  const _fetchRunDetail = useCallback(async (run, jsonPath) => {
    const parts = jsonPath.split('/');
    parts.pop(); // Remove "index.json"
    const categoryDir = parts.join('/') || 'reports';

    const reportUrl = `${categoryDir}/${run.timestamp}_report.json`;
    const res = await fetch(reportUrl);
    if (!res.ok) {
      throw new Error(`${run.timestamp}_report.json 로드에 실패했습니다.`);
    }

    const reportData = await res.json();
    
    // Map components for backward compatibility in components
    const components = (reportData.components || []).map((c) => ({
      file: c.defining_file,
      name: c.name,
      count: c.ref_count,
      package: c.package,
      ref_classes: c.ref_classes || [],
    }));

    // Construct unique files list
    const files = [...new Set(components.map((c) => c.file))].sort();

    setSelectedRun({
      ...reportData,
      components,
      files,
    });
  }, []);

  /** Fetch and parse the index JSON file. */
  const loadSourceIndex = useCallback(async (jsonPath) => {
    setLoading(true);
    setError(null);
    setReportRuns([]);
    setSelectedRun(null);
    setActiveJsonPath(jsonPath);

    try {
      const res = await fetch(jsonPath);
      if (!res.ok) {
        throw new Error(`파일을 불러오는데 실패했습니다 (HTTP ${res.status})`);
      }
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('조회된 리포트 내역이 없습니다.');
      }
      setReportRuns(data);

      // Auto-select the first run
      await _fetchRunDetail(data[0], jsonPath);
    } catch (err) {
      setError(_friendlyError(err));
    } finally {
      setLoading(false);
    }
  }, [_fetchRunDetail]);

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
        setError(_friendlyError(err));
      } finally {
        setLoading(false);
      }
    },
    [reportRuns, activeJsonPath, _fetchRunDetail]
  );

  const clearSelectedRun = useCallback(() => setSelectedRun(null), []);

  return { reportRuns, selectedRun, loading, error, loadSourceIndex, selectRun, clearSelectedRun };
}

function _friendlyError(err) {
  if (window.location.protocol === 'file:') {
    return (
      '로컬 파일 프로토콜(file://) 환경에서는 CORS 제한으로 데이터를 불러올 수 없습니다.\n' +
      '터미널에서 python -m http.server 8000 실행 후 http://localhost:8000 에 접속하세요.'
    );
  }
  return err.message;
}
