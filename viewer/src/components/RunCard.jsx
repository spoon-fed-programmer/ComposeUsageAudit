/**
 * Helper to format a report timestamp based on its folder name structure.
 * 
 * @param {string} timestamp - Folder name (e.g., '20260628', '2026_W25', '2026_06', '2026')
 * @returns {string} Formatted display label
 */
export function formatTimestamp(timestamp) {
  if (!timestamp) return '';
  
  // Weekly: e.g., '2026_W25'
  if (timestamp.includes('_W')) {
    const parts = timestamp.split('_');
    if (parts.length >= 2) {
      const year = parts[0];
      const week = parts[1].replace('W', '');
      return `${year}년 ${parseInt(week, 10)}주차`;
    }
  }
  
  // Monthly: e.g., '2026_06'
  if (timestamp.includes('_')) {
    const parts = timestamp.split('_');
    if (parts.length >= 2) {
      const year = parts[0];
      const month = parts[1];
      return `${year}년 ${parseInt(month, 10)}월`;
    }
  }
  
  // Daily: e.g., '20260628'
  if (timestamp.length === 8 && /^\d+$/.test(timestamp)) {
    const year = timestamp.substring(0, 4);
    const month = timestamp.substring(4, 6);
    const day = timestamp.substring(6, 8);
    return `${year}-${month}-${day}`;
  }
  
  // Yearly: e.g., '2026'
  if (timestamp.length === 4 && /^\d+$/.test(timestamp)) {
    return `${timestamp}년`;
  }
  
  return timestamp;
}

/**
 * RunCard - A single report history item in the sidebar.
 */
export default function RunCard({ run, isActive, onSelect }) {
  const title = formatTimestamp(run.timestamp);

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
      {/* Active left-bar indicator */}
      {isActive && (
        <span className="absolute left-0 top-0 h-full w-1 bg-accent rounded-l-md" />
      )}

      <div className="text-[15px] font-semibold mb-3">{title}</div>
      <div className="flex justify-between text-xs text-text-muted">
        <span>
          컴포넌트:{' '}
          <strong className="text-text-primary">{run.summary?.total_components ?? '-'}</strong>
        </span>
        <span>
          참조수:{' '}
          <strong className="text-text-primary">{run.summary?.total_references ?? '-'}</strong>
        </span>
      </div>
    </button>
  );
}
