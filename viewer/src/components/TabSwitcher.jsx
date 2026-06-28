/**
 * TabSwitcher - Renders the tab header bar.
 *
 * @param {object}   props
 * @param {'overview'|'files'} props.activeTab
 * @param {Function} props.onSwitch  - Called with tab name string
 */
import { useI18n } from '../contexts/I18nContext';

export default function TabSwitcher({ activeTab, onSwitch }) {
  const { t } = useI18n();
  const tabs = [
    { id: 'overview', label: t('tab_overview') },
    { id: 'files',    label: t('tab_files') },
    { id: 'modules',  label: t('tab_modules') },
  ];

  return (
    <div className="flex border-b border-border gap-6 mt-4">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onSwitch(tab.id)}
            className={[
              'relative pb-3 text-base font-semibold transition-colors duration-300 bg-transparent border-0 cursor-pointer font-sans',
              isActive ? 'text-accent' : 'text-text-secondary hover:text-text-primary',
            ].join(' ')}
          >
            {tab.label}
            {isActive && (
              <span className="absolute bottom-[-1px] left-0 w-full h-0.5 bg-accent tab-active-bar rounded" />
            )}
          </button>
        );
      })}
    </div>
  );
}
