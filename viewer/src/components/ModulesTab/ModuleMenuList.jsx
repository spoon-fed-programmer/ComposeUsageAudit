import { useI18n } from '../../contexts/I18nContext';

export default function ModuleMenuList({
  modules,
  selectedModule,
  onSelect,
  modulesData,
}) {
  const { t } = useI18n();

  return (
    <div className="flex flex-col gap-4 bg-panel border border-border rounded-lg p-5">
      <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider font-sans">
        {t('col_module_name')}
      </h3>
      <div className="flex flex-col gap-1 overflow-y-auto max-h-[calc(100vh-340px)] pr-1 custom-scrollbar">
        {modules.map((mod) => {
          const isActive = selectedModule === mod;
          // Calculate total reference count for this module
          const comps = modulesData[mod] || [];
          const totalRefs = comps.reduce((sum, c) => sum + c.total_count, 0);

          return (
            <button
              key={mod}
              onClick={() => onSelect(mod)}
              className={[
                'w-full flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-medium transition-all text-left cursor-pointer border-0 outline-none select-none font-sans',
                isActive
                  ? 'bg-accent/10 text-accent font-bold border-l-2 border-accent pl-2.5'
                  : 'bg-transparent text-text-secondary hover:text-text-primary hover:bg-white/[0.02]',
              ].join(' ')}
            >
              <span className="truncate mr-2" title={mod || '(root)'}>
                {mod || '(root)'}
              </span>
              <span
                className={[
                  'text-xs px-2 py-0.5 rounded-full shrink-0 font-mono font-semibold',
                  isActive ? 'bg-accent text-white' : 'bg-white/10 text-text-secondary',
                ].join(' ')}
              >
                {totalRefs}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
