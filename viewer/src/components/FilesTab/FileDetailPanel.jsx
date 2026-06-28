import { useI18n } from '../../contexts/I18nContext';
import ClassUsageList from '../ClassUsageList';

/**
 * FileDetailPanel - Right-side detail view showing components and usage in a file.
 *
 * @param {object|null} props.fileData   - { pkgName, fileName, comps }
 * @param {boolean}     props.loading
 * @param {string|null} props.error
 */
export default function FileDetailPanel({ fileData, loading, error }) {
  const { t } = useI18n();

  if (loading) {
    return (
      <div className="bg-panel border border-border rounded-lg p-8 flex items-center justify-center min-h-[400px]">
        <div className="spinner" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-panel border border-border rounded-lg p-8 min-h-[400px]">
        <p className="text-danger font-semibold mb-3">{t('load_file_error')}</p>
        <p className="text-sm text-text-secondary leading-relaxed">{error}</p>
      </div>
    );
  }

  if (!fileData) {
    return (
      <div className="bg-panel border border-border rounded-lg p-8 min-h-[400px] flex items-center justify-center text-text-muted">
        {t('select_file_placeholder')}
      </div>
    );
  }

  const { pkgName, fileName, comps } = fileData;

  return (
    <div className="bg-panel border border-border rounded-lg px-8 py-8 flex flex-col gap-6 min-h-[400px]">
      {/* File header */}
      <div className="border-b border-border pb-5">
        <div className="text-sm text-text-secondary font-mono mb-1">{t('package_label')}: {pkgName || 'N/A'}</div>
        <div className="text-2xl font-bold font-mono">{fileName}</div>
      </div>

      {/* Component cards */}
      <div className="flex flex-col gap-5">
        {comps.map((comp, idx) => {
          const compCount = typeof comp.count === 'number' && !isNaN(comp.count) ? comp.count : 0;
          const isUnused = compCount === 0;
          return (
            <div
              key={`${comp.name}-${idx}`}
              className="bg-card border border-border rounded-md p-5 flex flex-col gap-4 transition-colors hover:border-white/12"
            >
              {/* Card header */}
              <div className="flex items-center">
                <div className="text-lg font-semibold text-white flex items-center gap-3">
                  <span className="text-text-secondary font-normal">@Composable fun</span>
                  <strong>{comp.name}</strong>
                </div>
              </div>

              {/* Metrics row */}
              <div className="text-sm text-text-secondary">
                {t('ref_count_label')}: <strong className="text-text-primary font-mono">{compCount.toLocaleString()}</strong>{t('ref_count_suffix_times')}
              </div>

              {/* Usage list */}
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-text-muted mb-2">
                  {t('called_classes_label')}
                </div>
                <ClassUsageList
                  classes={comp.classes}
                  refsSuffix={t('refs_suffix')}
                  unusedMsg={t('unused_component_msg')}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
