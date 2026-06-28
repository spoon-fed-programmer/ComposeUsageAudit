import { useI18n } from '../contexts/I18nContext';
import { KRFlagIcon, USFlagIcon } from './icons';

/**
 * AppHeader - Sticky top navigation bar.
 *
 * @param {object}   props
 * @param {Function} props.onHome           - Called when logo is clicked
 * @param {number}   props.total            - Total components count
 * @param {number}   props.refs             - Total references count
 */
export default function AppHeader({ onHome, total, refs }) {
  const { lang, t, changeLang } = useI18n();
  const showMetrics = typeof total === 'number' && typeof refs === 'number';

  return (
    <header className="flex items-center justify-between px-10 py-5 border-b border-border backdrop-blur-header bg-bg/80 sticky top-0 z-50">
      {/* Logo */}
      <button
        onClick={onHome}
        className="flex items-center gap-2 cursor-pointer select-none bg-transparent border-0 p-0"
        id="logo-home-btn"
      >
        <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-br from-white to-accent bg-clip-text text-transparent flex items-center gap-2">
          {t('title')}
        </h1>
      </button>

      {/* KPI Metrics - Centered Card View */}
      {showMetrics && (
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-4">
          {/* Total Components */}
          <div className="flex flex-col items-center min-w-[110px] px-4 py-1.5 rounded-md border border-accent/30 bg-accent/5 backdrop-blur-sm shadow-[0_0_15px_rgba(99,102,241,0.15)]">
            <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider">{t('total_components')}</span>
            <span className="text-lg font-bold font-mono text-white leading-none mt-0.5" style={{ textShadow: '0 0 10px rgba(99,102,241,0.45)' }}>
              {total}
            </span>
          </div>

          {/* Total Reference Count */}
          <div className="flex flex-col items-center min-w-[110px] px-4 py-1.5 rounded-md border border-success/30 bg-success/5 backdrop-blur-sm shadow-[0_0_15px_rgba(16,185,129,0.15)]">
            <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider">{t('total_references')}</span>
            <span className="text-lg font-bold font-mono text-white leading-none mt-0.5" style={{ textShadow: '0 0 10px rgba(16,185,129,0.45)' }}>
              {refs}
            </span>
          </div>
        </div>
      )}

      {/* Language Switcher - Premium Capsule Style */}
      <div className="flex items-center gap-1 bg-black/20 p-1 rounded-full border border-border/60 backdrop-blur-sm z-10 shadow-sm">
        <button
          onClick={() => changeLang('ko')}
          className={[
            'px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer border-0 outline-none select-none',
            lang === 'ko'
              ? 'bg-accent text-white shadow-accent-sm scale-100 font-bold'
              : 'bg-transparent text-text-secondary hover:text-text-primary',
          ].join(' ')}
          title="한국어"
        >
          <KRFlagIcon className="w-[18px] h-[12px] rounded-[1px] shadow-sm shrink-0" />
          <span>KO</span>
        </button>
        <button
          onClick={() => changeLang('en')}
          className={[
            'px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer border-0 outline-none select-none',
            lang === 'en'
              ? 'bg-accent text-white shadow-accent-sm scale-100 font-bold'
              : 'bg-transparent text-text-secondary hover:text-text-primary',
          ].join(' ')}
          title="English"
        >
          <USFlagIcon className="w-[18px] h-[12px] rounded-[1px] shadow-sm shrink-0" />
          <span>EN</span>
        </button>
      </div>
    </header>
  );
}
