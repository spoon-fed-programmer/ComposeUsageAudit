import { useI18n } from '../contexts/I18nContext';

const USFlag = () => (
  <svg width="22" height="15" viewBox="0 0 24 16" className="rounded-sm shadow-sm">
    <rect width="24" height="16" fill="#3c3b6e"/>
    <g>
      {Array.from({ length: 13 }).map((_, i) => (
        <rect
          key={i}
          y={(i * 16) / 13}
          width="24"
          height={16 / 13}
          fill={i % 2 === 0 ? "#b22234" : "#ffffff"}
        />
      ))}
    </g>
    <rect width="10.8" height="8.6" fill="#3c3b6e"/>
    <circle cx="2" cy="2" r="0.4" fill="#ffffff"/>
    <circle cx="4" cy="2" r="0.4" fill="#ffffff"/>
    <circle cx="6" cy="2" r="0.4" fill="#ffffff"/>
    <circle cx="8" cy="2" r="0.4" fill="#ffffff"/>
    <circle cx="3" cy="4" r="0.4" fill="#ffffff"/>
    <circle cx="5" cy="4" r="0.4" fill="#ffffff"/>
    <circle cx="7" cy="4" r="0.4" fill="#ffffff"/>
    <circle cx="2" cy="6" r="0.4" fill="#ffffff"/>
    <circle cx="4" cy="6" r="0.4" fill="#ffffff"/>
    <circle cx="6" cy="6" r="0.4" fill="#ffffff"/>
    <circle cx="8" cy="6" r="0.4" fill="#ffffff"/>
  </svg>
);

const KRFlag = () => (
  <svg width="22" height="15" viewBox="0 0 24 16" className="rounded-sm shadow-sm bg-white border border-white">
    <rect width="24" height="16" fill="#ffffff" rx="1"/>
    <g transform="translate(12, 8)">
      <path d="M -4 0 A 4 4 0 0 1 4 0 A 2 2 0 0 1 0 0 A 2 2 0 0 0 -4 0" fill="#cd2e3a"/>
      <path d="M -4 0 A 4 4 0 0 0 4 0 A 2 2 0 0 0 0 0 A 2 2 0 0 1 -4 0" fill="#0047a0"/>
    </g>
    <g transform="translate(6, 4) rotate(33)">
      <line x1="-1.5" y1="-0.8" x2="1.5" y2="-0.8" stroke="#000000" strokeWidth="0.4"/>
      <line x1="-1.5" y1="0" x2="1.5" y2="0" stroke="#000000" strokeWidth="0.4"/>
      <line x1="-1.5" y1="0.8" x2="1.5" y2="0.8" stroke="#000000" strokeWidth="0.4"/>
    </g>
    <g transform="translate(18, 12) rotate(33)">
      <line x1="-1.5" y1="-0.8" x2="-0.2" y2="-0.8" stroke="#000000" strokeWidth="0.4"/>
      <line x1="0.2" y1="-0.8" x2="1.5" y2="-0.8" stroke="#000000" strokeWidth="0.4"/>
      <line x1="-1.5" y1="0" x2="-0.2" y2="0" stroke="#000000" strokeWidth="0.4"/>
      <line x1="0.2" y1="0" x2="1.5" y2="0" stroke="#000000" strokeWidth="0.4"/>
      <line x1="-1.5" y1="0.8" x2="-0.2" y2="0.8" stroke="#000000" strokeWidth="0.4"/>
      <line x1="0.2" y1="0.8" x2="1.5" y2="0.8" stroke="#000000" strokeWidth="0.4"/>
    </g>
    <g transform="translate(18, 4) rotate(-33)">
      <line x1="-1.5" y1="-0.8" x2="-0.2" y2="-0.8" stroke="#000000" strokeWidth="0.4"/>
      <line x1="0.2" y1="-0.8" x2="1.5" y2="-0.8" stroke="#000000" strokeWidth="0.4"/>
      <line x1="-1.5" y1="0" x2="1.5" y2="0" stroke="#000000" strokeWidth="0.4"/>
      <line x1="-1.5" y1="0.8" x2="-0.2" y2="0.8" stroke="#000000" strokeWidth="0.4"/>
      <line x1="0.2" y1="0.8" x2="1.5" y2="0.8" stroke="#000000" strokeWidth="0.4"/>
    </g>
    <g transform="translate(6, 12) rotate(-33)">
      <line x1="-1.5" y1="-0.8" x2="1.5" y2="-0.8" stroke="#000000" strokeWidth="0.4"/>
      <line x1="-1.5" y1="0" x2="-0.2" y2="0" stroke="#000000" strokeWidth="0.4"/>
      <line x1="0.2" y1="0" x2="1.5" y2="0" stroke="#000000" strokeWidth="0.4"/>
      <line x1="-1.5" y1="0.8" x2="1.5" y2="0.8" stroke="#000000" strokeWidth="0.4"/>
    </g>
  </svg>
);

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
          <span className="text-xs font-semibold text-accent bg-accent/15 border border-accent/30 px-2 py-1 rounded-sm normal-case tracking-normal">
            {t('viewer')}
          </span>
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

      {/* Language Switcher */}
      <div className="flex items-center gap-2 z-10">
        <button
          onClick={() => changeLang('ko')}
          className={[
            'p-1 rounded border transition-all cursor-pointer bg-transparent outline-none flex items-center justify-center',
            lang === 'ko'
              ? 'border-accent bg-accent/10 scale-105 shadow-[0_0_8px_rgba(99,102,241,0.3)]'
              : 'border-border opacity-40 hover:opacity-100 hover:bg-white/[0.04]',
          ].join(' ')}
          title="한국어"
        >
          <KRFlag />
        </button>
        <button
          onClick={() => changeLang('en')}
          className={[
            'p-1 rounded border transition-all cursor-pointer bg-transparent outline-none flex items-center justify-center',
            lang === 'en'
              ? 'border-accent bg-accent/10 scale-105 shadow-[0_0_8px_rgba(99,102,241,0.3)]'
              : 'border-border opacity-40 hover:opacity-100 hover:bg-white/[0.04]',
          ].join(' ')}
          title="English"
        >
          <USFlag />
        </button>
      </div>
    </header>
  );
}
