import RunCard from './RunCard';

/**
 * Sidebar - Report history list.
 *
 * @param {object}   props
 * @param {object[]} props.reportRuns      - All loaded report run objects
 * @param {object|null} props.selectedRun   - Currently active run
 * @param {boolean}  props.loading         - True while index is loading
 * @param {string|null} props.error        - Error message if load failed
 * @param {Function} props.onSelectRun     - Called with a timestamp when a card is clicked
 * @param {string}   props.intervalLabel   - The active interval type (e.g. '일별', '주간별')
 */
export default function Sidebar({ reportRuns, selectedRun, loading, error, onSelectRun, intervalLabel }) {
  return (
    <aside className="w-80 border-r border-border px-6 py-6 flex flex-col gap-5 bg-[rgba(17,22,34,0.3)] overflow-y-auto shrink-0">
      <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-widest">
        리포트 이력 {intervalLabel ? `(${intervalLabel})` : ''}
      </h2>

      <div className="flex flex-col gap-3">
        {loading && <div className="spinner" />}

        {error && !loading && (
          <div className="text-sm text-danger leading-relaxed whitespace-pre-line">{error}</div>
        )}

        {!loading && !error && reportRuns.length === 0 && (
          <p className="text-sm text-text-muted">조회된 리포트 내역이 없습니다.</p>
        )}

        {!loading &&
          reportRuns.map((run) => (
            <RunCard
              key={run.timestamp}
              run={run}
              isActive={selectedRun?.timestamp === run.timestamp}
              onSelect={onSelectRun}
              intervalLabel={intervalLabel}
            />
          ))}
      </div>
    </aside>
  );
}
