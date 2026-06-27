/**
 * RunCard - A single report history item in the sidebar.
 *
 * @param {object}   props
 * @param {object}   props.run        - Report run object
 * @param {boolean}  props.isActive   - Whether this run is currently selected
 * @param {Function} props.onSelect   - Callback when card is clicked
 */
export default function RunCard({ run, isActive, onSelect }) {
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

      <div className="text-[15px] font-semibold mb-1.5">{run.date}</div>
      <div className="text-sm text-text-secondary mb-3">{run.project_name}</div>
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
