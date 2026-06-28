import { useI18n } from '../../contexts/I18nContext';

export default function ModuleDetailPanel({
  selectedModule,
  componentsData,
}) {
  const { t } = useI18n();

  if (!selectedModule && selectedModule !== '') {
    return (
      <div className="flex-1 bg-panel border border-border rounded-lg p-10 flex items-center justify-center text-text-muted font-sans min-h-[300px]">
        {t('no_module_details')}
      </div>
    );
  }

  const moduleDisplayName = selectedModule || '(root)';

  return (
    <div className="flex-1 flex flex-col gap-6 overflow-hidden">
      {/* Header card */}
      <div className="bg-panel border border-border rounded-lg p-6 flex flex-col gap-2 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-24 h-24 bg-accent/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-baseline gap-2">
          <span className="text-xs text-accent font-semibold uppercase tracking-wider font-sans">
            Android Module
          </span>
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight font-sans">
          {moduleDisplayName}
        </h2>
      </div>

      {/* Component Reference List */}
      <div className="flex flex-col gap-6 overflow-y-auto max-h-[calc(100vh-340px)] pr-2 custom-scrollbar">
        {componentsData.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-text-muted">
            {t('no_module_details')}
          </div>
        ) : (
          componentsData.map((comp) => (
            <div
              key={`${comp.defining_file}::${comp.name}`}
              className="bg-panel/40 border border-border/80 hover:border-border rounded-lg p-6 flex flex-col gap-5 transition-all duration-300 relative overflow-hidden"
            >
              {/* Component Header info */}
              <div className="flex justify-between items-start gap-4">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="text-lg font-bold text-white hover:text-accent transition-colors font-sans">
                      {comp.name}
                    </h3>
                    <span className="text-xs px-2 py-0.5 rounded bg-white/5 border border-border/60 text-text-secondary font-mono">
                      {comp.defining_file}
                    </span>
                  </div>
                  <div className="text-xs text-text-muted font-sans">
                    {t('package_label')}: <span className="font-mono text-text-secondary">{comp.package}</span>
                  </div>
                </div>

                {/* Count badge */}
                <div className="flex flex-col items-end shrink-0">
                  <span className="text-2xl font-bold text-accent font-mono">
                    {comp.total_count}
                  </span>
                  <span className="text-[10px] text-text-muted uppercase font-semibold font-sans tracking-wide">
                    {t('ref_count_label')}
                  </span>
                </div>
              </div>

              {/* Reference Classes Detail */}
              <div className="border-t border-border/60 pt-4 flex flex-col gap-3">
                <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider font-sans">
                  {t('called_classes_label')}
                </h4>

                <div className="flex flex-col gap-2">
                  {comp.classes.map((cls, idx) => (
                    <div
                      key={`${cls.class_name}-${idx}`}
                      className="flex justify-between items-center bg-black/15 px-4 py-3 rounded-md hover:bg-black/25 transition-all"
                    >
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-white font-mono leading-none">
                            {cls.class_name}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-accent/2 text-accent font-sans font-bold uppercase leading-none border border-accent/20">
                            {cls.source_set}
                          </span>
                        </div>
                        
                        {/* Lines tag rendering */}
                        {cls.lines && cls.lines.length > 0 && (
                          <div className="flex items-center gap-1.5 text-xs text-text-muted mt-1 font-sans">
                            <span>{t('line_label')}:</span>
                            <div className="flex items-center gap-1 flex-wrap">
                              {cls.lines.map((ln) => (
                                <span
                                  key={ln}
                                  className="px-1.5 py-0.2 bg-white/5 rounded border border-border/40 font-mono text-[11px] text-text-secondary"
                                >
                                  {ln}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="text-sm font-bold text-white/90 font-mono shrink-0">
                        {cls.count}
                        <span className="text-xs font-normal text-text-muted ml-0.5">
                          {t('refs_suffix')}
                        </span>
                      </div>
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
