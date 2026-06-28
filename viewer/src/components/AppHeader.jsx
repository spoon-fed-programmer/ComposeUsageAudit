/**
 * AppHeader - Sticky top navigation bar.
 *
 * @param {object}   props
 * @param {Function} props.onHome           - Called when logo is clicked
 * @param {string}   props.sourcePath       - Currently selected JSON source path
 * @param {Function} props.onSourceChange   - Called when the dropdown changes
 * @param {Function} props.onLoadSource     - Called when user submits a custom path
 */
export default function AppHeader({ onHome, total, refs }) {
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
          Compose Component Audit
          <span className="text-xs font-semibold text-accent bg-accent/15 border border-accent/30 px-2 py-1 rounded-sm normal-case tracking-normal">
            Viewer
          </span>
        </h1>
      </button>

      {/* KPI Metrics - Centered Card View */}
      {showMetrics && (
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-4">
          {/* Total Components */}
          <div className="flex flex-col items-center min-w-[110px] px-4 py-1.5 rounded-md border border-accent/30 bg-accent/5 backdrop-blur-sm shadow-[0_0_15px_rgba(99,102,241,0.15)]">
            <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider">전체 컴포넌트</span>
            <span className="text-lg font-bold font-mono text-white leading-none mt-0.5" style={{ textShadow: '0 0 10px rgba(99,102,241,0.45)' }}>
              {total}
            </span>
          </div>

          {/* Total Reference Count */}
          <div className="flex flex-col items-center min-w-[110px] px-4 py-1.5 rounded-md border border-success/30 bg-success/5 backdrop-blur-sm shadow-[0_0_15px_rgba(16,185,129,0.15)]">
            <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider">총 참조 횟수</span>
            <span className="text-lg font-bold font-mono text-white leading-none mt-0.5" style={{ textShadow: '0 0 10px rgba(16,185,129,0.45)' }}>
              {refs}
            </span>
          </div>
        </div>
      )}
    </header>
  );
}
