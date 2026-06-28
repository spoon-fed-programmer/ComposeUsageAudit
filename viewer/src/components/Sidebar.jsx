import { useI18n } from '../contexts/I18nContext';
import RunCard from './RunCard';

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
}) {
  const { t } = useI18n();

  const intervals = [
    { label: t('daily'), value: 'reports/compose_common_component/summary_daily/index.json' },
    { label: t('weekly'), value: 'reports/compose_common_component/summary_weekly/index.json' },
    { label: t('monthly'), value: 'reports/compose_common_component/summary_monthly/index.json' },
    { label: t('yearly'), value: 'reports/compose_common_component/summary_yearly/index.json' },
  ];

  return (
    <aside className="w-80 border-r border-border px-6 py-6 flex flex-col gap-5 bg-[rgba(17,22,34,0.3)] overflow-y-auto shrink-0">

      <div className="flex flex-col gap-4">
        {/* Interval filter tabs */}
        <div className="flex bg-black/20 p-1 rounded-md border border-border/60 backdrop-blur-sm shadow-sm w-full">
          {intervals.map((item) => {
            const isActive = sourcePath === item.value;
            return (
              <button
                key={item.value}
                onClick={() => onSourceChange(item.value)}
                className={[
                  'flex-1 text-center py-1.5 rounded-sm text-xs font-semibold cursor-pointer border-0 outline-none select-none transition-all',
                  isActive
                    ? 'bg-accent text-white shadow-accent-sm font-bold'
                    : 'bg-transparent text-text-secondary hover:text-text-primary',
                ].join(' ')}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-end gap-2 border-b border-border pb-3">
          {!loading && !error && reportRuns.length > 0 && (
            <button
              onClick={onViewAllHistory}
              className={[
                'text-xs font-semibold hover:underline cursor-pointer bg-transparent border-0 p-0 transition-colors',
                isMatrixActive ? 'text-accent hover:text-accent' : 'text-text-secondary hover:text-accent',
              ].join(' ')}
            >
              {t('view_all_history')}
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {loading && <div className="spinner" />}

        {error && !loading && (
          <div className="text-sm text-danger leading-relaxed whitespace-pre-line">{error}</div>
        )}

        {!loading && !error && reportRuns.length === 0 && (
          <p className="text-sm text-text-muted">{t('no_reports_found')}</p>
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
