import { useI18n } from '../contexts/I18nContext';

/**
 * Helper to format a report timestamp based on its folder name structure.
 * 
 * @param {string} timestamp - Folder name (e.g., '20260628', '2026_W25', '2026_06', '2026')
 * @param {Function} t - Translation function
 * @returns {string} Formatted display label
 */
export function formatTimestamp(timestamp, t) {
  if (!timestamp) return '';
  if (!t) t = (k) => k; // fallback
  
  // Weekly: e.g., '2026_W25' -> '26년 25주'
  if (timestamp.includes('_W')) {
    const parts = timestamp.split('_');
    if (parts.length >= 2) {
      const year = parts[0].substring(2);
      const week = parts[1].replace('W', '');
      return `${year}${t('year_suffix')} ${parseInt(week, 10)}${t('week_suffix')}`;
    }
  }
  
  // Monthly: e.g., '2026_06' -> '26년 6월'
  if (timestamp.includes('_')) {
    const parts = timestamp.split('_');
    if (parts.length >= 2) {
      const year = parts[0].substring(2);
      const month = parts[1];
      return `${year}${t('year_suffix')} ${parseInt(month, 10)}${t('month_suffix')}`;
    }
  }
  
  // Daily: e.g., '20260628' -> '26-06-28'
  if (timestamp.length === 8 && /^\d+$/.test(timestamp)) {
    const year = timestamp.substring(2, 4);
    const month = timestamp.substring(4, 6);
    const day = timestamp.substring(6, 8);
    return `${year}-${month}-${day}`;
  }
  
  // Yearly: e.g., '2026' -> '26년'
  if (timestamp.length === 4 && /^\d+$/.test(timestamp)) {
    return `${timestamp.substring(2)}${t('year_suffix')}`;
  }
  
  return timestamp;
}

/**
 * RunCard - A single report history item in the sidebar.
 */
export default function RunCard({ run, isActive, onSelect }) {
  const { t } = useI18n();
  const title = formatTimestamp(run.timestamp, t);

  return (
    <button
      onClick={() => onSelect(run.timestamp)}
      className={[
        'relative w-full text-left rounded-md border px-4 py-4 transition-all duration-300 cursor-pointer overflow-hidden',
        'bg-panel',
        isActive
          ? 'border-accent bg-accent/8 shadow-[0_0_20px_rgba(99,102,241,0.1)]'
          : 'border-border hover:border-accent hover:bg-panel/80 hover:-translate-y-0.5',
      ].join(' ')}
    >


      <div className="text-[15px] font-semibold mb-3">{title}</div>
      <div className="flex justify-between text-xs text-text-muted">
        <span>
          {t('components_label')}:{' '}
          <strong className="text-text-primary">
            {run.summary?.total_components !== undefined && run.summary?.total_components !== null
              ? run.summary.total_components.toLocaleString()
              : '-'}
          </strong>
        </span>
        <span>
          {t('references_label')}:{' '}
          <strong className="text-text-primary">
            {run.summary?.total_references !== undefined && run.summary?.total_references !== null
              ? run.summary.total_references.toLocaleString()
              : '-'}
          </strong>
        </span>
      </div>
    </button>
  );
}
