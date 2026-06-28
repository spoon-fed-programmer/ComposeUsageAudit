import { useI18n } from '../../contexts/I18nContext';

/**
 * ModuleDetailPanel - Right-side detail view showing components and usage in a module.
 */
export default function ModuleDetailPanel({
  selectedModule,
  componentsData,
}) {
  const { t } = useI18n();

  if (selectedModule === null || selectedModule === undefined) {
    return (
      <div className="bg-panel border border-border rounded-lg p-8 min-h-[400px] flex items-center justify-center text-text-muted">
        {t('no_module_details')}
      </div>
    );
  }

  const moduleDisplayName = selectedModule || '(root)';

  return (
    <div className="bg-panel border border-border rounded-lg px-8 py-8 flex flex-col gap-6 min-h-[400px]">
      {/* Module header */}
      <div className="border-b border-border pb-5">
        <div className="text-sm text-text-secondary font-sans mb-1">Android Module</div>
        <div className="text-2xl font-bold font-mono">{moduleDisplayName}</div>
      </div>

      {/* Component cards */}
      <div className="flex flex-col gap-5">
        {componentsData.length === 0 ? (
          <div className="text-sm text-text-muted italic py-1">
            {t('no_module_details')}
          </div>
        ) : (
          componentsData.map((comp, idx) => (
            <div
              key={`${comp.defining_file}::${comp.name}-${idx}`}
              className="bg-card border border-border rounded-md p-5 flex flex-col gap-4 transition-colors hover:border-white/12"
            >
              {/* Card header */}
              <div className="flex items-center">
                <div className="text-lg font-semibold text-white flex items-center gap-3 flex-wrap">
                  <span className="text-text-secondary font-normal">@Composable fun</span>
                  <strong>{comp.name}</strong>
                  <span className="text-xs px-2 py-0.5 rounded bg-white/5 border border-border/60 text-text-secondary font-mono">
                    {comp.defining_file}
                  </span>
                </div>
              </div>

              {/* Metrics row */}
              <div className="text-sm text-text-secondary">
                {t('ref_count_label')}: <strong className="text-text-primary font-mono">{comp.total_count}</strong>{t('ref_count_suffix_times')}
              </div>

              {/* Usage list */}
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-text-muted mb-2">
                  {t('called_classes_label')}
                </div>
                <div className="flex flex-col gap-1.5">
                  {comp.classes.map((cls, i) => (
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
                          <span className="truncate text-text-secondary flex items-center gap-1.5" title={cls.class_name}>
                            <span className="truncate">{cls.class_name}</span>
                            {cls.source_set && (
                              <span className="text-[11px] text-text-muted opacity-60 font-sans font-normal shrink-0 select-none ml-1">
                                ({cls.source_set})
                              </span>
                            )}
                          </span>
                        </div>
                        <span className="text-[10px] font-semibold text-text-muted bg-white/[0.05] border border-border px-1.5 py-0.5 rounded-sm shrink-0">
                          {cls.count}{t('refs_suffix')}
                        </span>
                      </div>
                      {cls.lines && cls.lines.length > 0 && (
                        <div className="flex items-center gap-1.5 text-xs text-text-muted px-3.5 mt-0.5">
                          <span>{t('line_label')}:</span>
                          <div className="flex flex-wrap gap-1">
                            {cls.lines.map((ln) => (
                              <span key={ln} className="text-accent bg-accent/10 border border-accent/20 px-1 rounded-sm text-[10px] font-bold">
                                {ln}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
