import { useI18n } from '../../contexts/I18nContext';
import ClassUsageList from '../ClassUsageList';

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
          componentsData.map((comp, idx) => {
            const compCount = typeof comp.total_count === 'number' && !isNaN(comp.total_count) ? comp.total_count : 0;
            const isUnused = compCount === 0;
            return (
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
          })
        )}
      </div>
    </div>
  );
}
