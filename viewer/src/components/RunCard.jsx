/**
 * RunCard - A single report history item in the sidebar.
 *
 * @param {object}   props
 * @param {object}   props.run          - Report run object
 * @param {boolean}  props.isActive     - Whether this run is currently selected
 * @param {Function} props.onSelect     - Callback when card is clicked
 * @param {string}   props.intervalLabel - The label indicating daily, weekly, monthly, yearly
 */
export default function RunCard({ run, isActive, onSelect, intervalLabel }) {
  let title = run.date;
  
  if (intervalLabel === '주간별') {
    const parts = run.timestamp.split('_');
    if (parts.length >= 2) {
      const year = parts[0];
      const week = parts[1].replace('W', '');
      title = `${year}년 ${parseInt(week, 10)}주차`;
    }
  } else if (intervalLabel === '월간별') {
    const parts = run.timestamp.split('_');
    if (parts.length >= 2) {
      const year = parts[0];
      const month = parts[1];
      title = `${year}년 ${parseInt(month, 10)}월`;
    }
  } else if (intervalLabel === '연간별') {
    title = `${run.timestamp}년`;
  }

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
