import { useI18n } from '../../contexts/I18nContext';

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
          const isUnused = comp.count === 0;
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
                {t('ref_count_label')}: <strong className="text-text-primary font-mono">{comp.count}</strong>{t('ref_count_suffix_times')}
              </div>

              {/* Usage list */}
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-text-muted mb-2">
                  {t('called_classes_label')}
                </div>
                <div className="flex flex-col gap-1.5">
                  {isUnused ? (
                    <div className="text-sm text-text-muted italic py-1">
                      {t('unused_component_msg')}
                    </div>
                  ) : (
                    comp.classes.map((cls, i) => {
                      const isObj = cls && typeof cls === 'object';
                      const classNameStr = isObj ? cls.class_name : cls;
                      const refCount = isObj ? cls.count : null;
                      const lineNumbers = isObj && Array.isArray(cls.lines) ? cls.lines : [];

                      return (
                        <div
                          key={i}
                          className="flex flex-col gap-1.5 bg-white/[0.03] border border-border px-3.5 py-2.5 rounded-sm font-mono text-sm text-text-secondary transition-colors"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 truncate">
                              <span
                                className="inline-block w-1.5 h-1.5 rounded-full bg-accent shrink-0"
                                style={{ boxShadow: '0 0 6px #6366f1' }}
                              />
                              <span className="truncate text-text-secondary flex items-center gap-1.5" title={classNameStr}>
                                <span className="truncate">{classNameStr}</span>
                                {isObj && cls.source_set && (
                                  <span className="text-[10px] text-text-muted bg-white/[0.04] border border-border/40 px-1.5 py-0.5 rounded font-sans uppercase tracking-wider scale-90 shrink-0 select-none">
                                    {cls.source_set}
                                  </span>
                                )}
                              </span>
                            </div>
                            {refCount !== null && (
                              <span className="text-[10px] font-semibold text-text-muted bg-white/[0.05] border border-border px-1.5 py-0.5 rounded-sm shrink-0">
                                {refCount}{t('refs_suffix')}
                              </span>
                            )}
                          </div>
                          {lineNumbers.length > 0 && (
                            <div className="flex items-center gap-1.5 text-xs text-text-muted px-3.5 mt-0.5">
                              <span>{t('line_label')}:</span>
                              <div className="flex flex-wrap gap-1">
                                {lineNumbers.map((ln) => (
                                  <span key={ln} className="text-accent bg-accent/10 border border-accent/20 px-1 rounded-sm text-[10px] font-bold">
                                    {ln}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
