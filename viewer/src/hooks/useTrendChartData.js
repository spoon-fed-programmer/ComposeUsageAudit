import { useMemo } from 'react';
import { formatTimestamp } from '../components/RunCard';
import { useI18n } from '../contexts/I18nContext';

/**
 * Custom hook to prepare and scale X/Y axis data points for the trend chart.
 */
export function useTrendChartData(reportRuns) {
  const { t } = useI18n();

  const data = useMemo(() => {
    return reportRuns.map((run) => {
      const refs = run.summary ? run.summary.total_references : 0;
      const comps = run.summary ? run.summary.total_components : 0;
      return {
        name: formatTimestamp(run.timestamp, t),
        refs,
        comps,
      };
    });
  }, [reportRuns, t]);

  const chartWidth = useMemo(() => {
    if (data.length === 0) return 800;
    // 385px (table headers) + (runs count * 90px column width)
    return 385 + data.length * 90;
  }, [data]);

  return { data, chartWidth };
}
