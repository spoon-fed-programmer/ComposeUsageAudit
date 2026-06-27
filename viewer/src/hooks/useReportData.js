import { useState, useCallback } from 'react';
import { parseCSV } from '../utils/csvParser';

/**
 * Custom hook that manages loading the report index JSON and
 * fetching + parsing the summary CSV for the selected run.
 *
 * @returns {{
 *   reportRuns: object[],
 *   selectedRun: object|null,
 *   loading: boolean,
 *   error: string|null,
 *   loadSourceIndex: (path: string) => Promise<void>,
 *   selectRun: (timestamp: string) => Promise<void>,
 *   clearSelectedRun: () => void,
 * }}
 */
export function useReportData() {
  const [reportRuns, setReportRuns] = useState([]);
  const [selectedRun, setSelectedRun] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /** Fetch and parse the index JSON file. */
  const loadSourceIndex = useCallback(async (jsonPath) => {
    setLoading(true);
    setError(null);
    setReportRuns([]);
    setSelectedRun(null);

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
      await _fetchRunDetail(data[0], data, setSelectedRun);
    } catch (err) {
      setError(_friendlyError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  /** Select a run by timestamp, fetching its summary.csv detail. */
  const selectRun = useCallback(
    async (timestamp) => {
      const run = reportRuns.find((r) => r.timestamp === timestamp);
      if (!run) return;
      setLoading(true);
      setError(null);
      try {
        await _fetchRunDetail(run, reportRuns, setSelectedRun);
      } catch (err) {
        setError(_friendlyError(err));
      } finally {
        setLoading(false);
      }
    },
    [reportRuns]
  );

  const clearSelectedRun = useCallback(() => setSelectedRun(null), []);

  return { reportRuns, selectedRun, loading, error, loadSourceIndex, selectRun, clearSelectedRun };
}

// ─── helpers ──────────────────────────────────────────────────────────────────

async function _fetchRunDetail(run, _allRuns, setSelectedRun) {
  const summaryUrl = `reports/${run.timestamp}/summary.csv`;
  const res = await fetch(summaryUrl);
  if (!res.ok) throw new Error('summary.csv 로드에 실패했습니다.');

  const csvText = await res.text();
  const parsed = parseCSV(csvText);

  // Find the component table start (row with ["File","Component","Reference Count"])
  let componentStartIdx = -1;
  for (let i = 0; i < parsed.length; i++) {
    if (parsed[i][0] === 'File' && parsed[i][1] === 'Component') {
      componentStartIdx = i + 1;
      break;
    }
  }

  const components = [];
  if (componentStartIdx !== -1) {
    for (let i = componentStartIdx; i < parsed.length; i++) {
      const row = parsed[i];
      if (row.length >= 3) {
        components.push({
          file: row[0],
          name: row[1],
          count: parseInt(row[2], 10) || 0,
        });
      }
    }
  }

  setSelectedRun({ ...run, components });
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
