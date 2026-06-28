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

  return (
    <aside className="w-80 border-r border-border px-6 py-6 flex flex-col gap-5 bg-[rgba(17,22,34,0.3)] overflow-y-auto shrink-0">

      <div className="flex items-center justify-between gap-2 border-b border-border pb-3">
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-widest">
          {t('report_history')}
        </h2>
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
