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

      {/* KPI Metrics */}
      {showMetrics && (
        <div className="flex items-center gap-4">
          {/* Total Components */}
          <div className="flex items-center gap-2.5 px-4 py-1.5 rounded border border-accent/25 bg-accent/5 shadow-[0_0_15px_rgba(99,102,241,0.12)]">
            <span className="text-xs font-semibold text-text-secondary">전체 컴포넌트</span>
            <span className="text-sm font-bold font-mono text-white" style={{ textShadow: '0 0 8px rgba(99,102,241,0.35)' }}>
              {total}
            </span>
          </div>

          {/* Total Reference Count */}
          <div className="flex items-center gap-2.5 px-4 py-1.5 rounded border border-success/25 bg-success/5 shadow-[0_0_15px_rgba(16,185,129,0.12)]">
            <span className="text-xs font-semibold text-text-secondary">총 사용 참조 횟수</span>
            <span className="text-sm font-bold font-mono text-white" style={{ textShadow: '0 0 8px rgba(16,185,129,0.35)' }}>
              {refs}
            </span>
          </div>
        </div>
      )}
    </header>
  );
}
