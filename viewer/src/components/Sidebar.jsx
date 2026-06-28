import RunCard from './RunCard';

/**
 * Sidebar - Report history list with View All History button.
 *
 * @param {object}   props
 * @param {object[]} props.reportRuns      - All loaded report run objects
 * @param {object|null} props.selectedRun   - Currently active run
 * @param {boolean}  props.loading         - True while index is loading
 * @param {string|null} props.error        - Error message if load failed
 * @param {Function} props.onSelectRun     - Called with a timestamp when a card is clicked
 * @param {string}   props.intervalLabel   - The active interval type (e.g. '일별', '주간별')
 * @param {boolean}  props.isMatrixActive  - Whether the matrix view is currently active
 * @param {Function} props.onViewAllHistory - Called when clicking "전체 이력 보기"
 */
export default function Sidebar({
  reportRuns,
  selectedRun,
  loading,
  error,
  onSelectRun,
  intervalLabel,
  isMatrixActive,
  onViewAllHistory,
  sourcePath,
  onSourceChange,
  onLoadSource,
}) {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') onLoadSource(e.target.value);
  };

  return (
    <aside className="w-80 border-r border-border px-6 py-6 flex flex-col gap-5 bg-[rgba(17,22,34,0.3)] overflow-y-auto shrink-0">
      {/* 데이터 소스 선택 */}
      <div className="flex flex-col gap-2 border-b border-border pb-4">
        <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">
          데이터 소스
        </label>
        <div className="grid grid-cols-5 gap-0.5 bg-black/40 p-1 rounded border border-border">
          {[
            { label: '일별', value: 'reports/compose_common_component/summary_daily/index.json' },
            { label: '주간', value: 'reports/compose_common_component/summary_weekly/index.json' },
            { label: '월간', value: 'reports/compose_common_component/summary_monthly/index.json' },
            { label: '연간', value: 'reports/compose_common_component/summary_yearly/index.json' },
            { label: '직접', value: 'custom' },
          ].map((opt) => {
            const isSelected = sourcePath === opt.value;
            return (
              <button
                key={opt.label}
                onClick={() => onSourceChange(opt.value)}
                className={[
                  'text-[11px] font-medium py-1.5 rounded transition-all cursor-pointer border-0',
                  isSelected
                    ? 'bg-accent text-white shadow-accent-sm'
                    : 'bg-transparent text-text-secondary hover:text-text-primary hover:bg-white/[0.04]',
                ].join(' ')}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {sourcePath === 'custom' && (
          <div className="flex gap-1.5 mt-1.5">
            <input
              type="text"
              id="json-source-input"
              placeholder="경로 입력 (예: reports/custom.json)"
              onKeyPress={handleKeyPress}
              className="bg-black/30 text-text-primary border border-border px-2.5 py-1.5 rounded text-xs font-sans outline-none flex-1 transition-all focus:border-accent"
            />
            <button
              onClick={() => {
                const input = document.getElementById('json-source-input');
                onLoadSource(input?.value?.trim());
              }}
              className="bg-accent hover:bg-accent-hover text-white px-3 py-1.5 rounded text-xs font-semibold cursor-pointer transition-all hover:shadow-accent-sm"
            >
              로드
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 border-b border-border pb-3">
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-widest">
          리포트 이력 {intervalLabel ? `(${intervalLabel})` : ''}
        </h2>
        {!loading && !error && reportRuns.length > 0 && (
          <button
            onClick={onViewAllHistory}
            className={[
              'text-xs font-semibold hover:underline cursor-pointer bg-transparent border-0 p-0 transition-colors',
              isMatrixActive ? 'text-accent hover:text-accent' : 'text-text-secondary hover:text-accent',
            ].join(' ')}
          >
            전체 이력 보기
          </button>
        )}
      </div>

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
              isActive={!isMatrixActive && selectedRun?.timestamp === run.timestamp}
              onSelect={onSelectRun}
              intervalLabel={intervalLabel}
            />
          ))}
      </div>
    </aside>
  );
}
