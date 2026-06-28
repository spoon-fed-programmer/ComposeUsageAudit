import { useMemo } from 'react';
import { formatTimestamp } from '../components/RunCard';
import { useI18n } from '../contexts/I18nContext';

/**
 * Custom hook to prepare and scale X/Y axis data points for the trend chart.
 */
export function useTrendChartData(reportRuns, viewMode) {
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
    // Dynamic left column width: 385px for components tab, 220px for modules tab
    const leftHeaderWidth = viewMode === 'component' ? 385 : 220;
    return leftHeaderWidth + data.length * 90;
  }, [data, viewMode]);

  return { data, chartWidth };
}
