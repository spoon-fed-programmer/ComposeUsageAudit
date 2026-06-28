/**
 * ComponentsGrid - Renders components grouped by defining files in a card grid view.
 *
 * @param {object}   props
 * @param {object[]} props.components - Array of { file, name, count }
 * @param {Function} props.onNavigate  - Called with file name when header is clicked
 */
import { useI18n } from '../../contexts/I18nContext';

export default function ComponentsGrid({ components, onNavigate }) {
  const { t } = useI18n();

  // Group components while preserving the sorted order from the parent
  const grouped = {};
  const fileOrder = [];
  
  components.forEach((c) => {
    if (!grouped[c.file]) {
      grouped[c.file] = [];
      fileOrder.push(c.file);
    }
    grouped[c.file].push(c);
  });

  if (components.length === 0) {
    return (
      <div className="text-center text-text-muted py-12 bg-panel border border-border rounded-lg">
        {t('no_components_matched')}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {fileOrder.map((fileName) => {
        const fileComps = grouped[fileName];
        const totalRefs = fileComps.reduce((sum, c) => sum + c.count, 0);
        return (
          <div key={fileName} className="flex flex-col gap-4">
            {/* File Header */}
            <div className="flex items-center gap-3 border-b border-border/60 pb-2.5">
              <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <button
                onClick={() => onNavigate(fileName)}
                className="text-base font-bold font-mono text-white hover:text-accent hover:underline cursor-pointer bg-transparent border-0 p-0"
              >
                {fileName}
              </button>
              <span className="text-[11px] text-text-secondary bg-white/5 border border-border px-2.5 py-0.5 rounded-full font-sans">
                {t('component_count', { count: fileComps.length })}
              </span>
              <span className="text-[11px] text-text-secondary bg-white/5 border border-border px-2.5 py-0.5 rounded-full font-sans">
                {t('total_refs_count', { count: totalRefs })}
              </span>
            </div>

            {/* Components Grid for this file */}
            <div
              className="grid gap-5"
              style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}
            >
              {fileComps.map((c, idx) => {
                const isUnused = c.count === 0;
                return (
                  <div
                    key={`${c.file}-${c.name}-${idx}`}
                    className="bg-card border border-border rounded-md p-5 flex flex-col justify-between transition-all duration-300 hover:border-accent hover:-translate-y-0.5"
                  >
                    <div>
                      {/* Component Name */}
                      <h3 className="text-[15px] font-bold text-white mb-4 select-all break-all leading-tight">
                        {c.name}
                      </h3>
                    </div>

                    {/* Footer metrics */}
                    <div className="flex justify-between items-center border-t border-border/40 pt-3">
                      <span className="text-xs text-text-secondary">{t('refs_count_label')}</span>
                      <span className={[
                        'text-xs font-bold font-mono px-2.5 py-0.5 rounded-full border',
                        isUnused
                          ? 'bg-white/4 text-text-muted border-border'
                          : 'bg-success-glow text-success border-success/20',
                      ].join(' ')}>
                        {c.count}{t('refs_count_suffix')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
