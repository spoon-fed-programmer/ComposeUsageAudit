import { useI18n } from '../../contexts/I18nContext';

export default function ModuleMenuList({
  modules,
  selectedModule,
  onSelect,
  modulesData,
}) {
  const { t } = useI18n();

  return (
    <div className="flex flex-col gap-1.5 bg-[rgba(17,22,34,0.4)] border border-border p-3 rounded-md">
      <div className="text-[11px] font-semibold uppercase text-text-muted tracking-wider px-2.5 pb-2.5">
        {t('col_module_name')}
      </div>

      <div className="flex flex-col gap-1 overflow-y-auto max-h-[calc(100vh-340px)] pr-1 custom-scrollbar">
        {modules.map((mod) => {
          const isActive = selectedModule === mod;
          const comps = modulesData[mod] || [];
          const totalRefs = comps.reduce((sum, c) => sum + c.total_count, 0);

          return (
            <button
              key={mod}
              onClick={() => onSelect(mod)}
              className={[
                'w-full flex items-center justify-between px-3.5 py-2.5 rounded-sm text-left font-sans text-sm transition-all duration-200 cursor-pointer border-0 outline-none select-none',
                isActive
                  ? 'bg-accent text-white font-semibold shadow-accent-sm'
                  : 'bg-transparent text-text-secondary hover:bg-white/4 hover:text-text-primary',
              ].join(' ')}
            >
              <span className="truncate mr-2" title={mod || '(root)'}>
                {mod || '(root)'}
              </span>
              <span
                className={[
                  'text-[10px] font-semibold px-1.5 py-0.5 rounded-sm shrink-0 font-mono',
                  isActive ? 'bg-white/20 text-white' : 'bg-white/[0.05] border border-border text-text-muted',
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
