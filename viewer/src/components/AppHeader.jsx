/**
 * AppHeader - Sticky top navigation bar.
 *
 * @param {object}   props
 * @param {Function} props.onHome           - Called when logo is clicked
 * @param {string}   props.sourcePath       - Currently selected JSON source path
 * @param {Function} props.onSourceChange   - Called when the dropdown changes
 * @param {Function} props.onLoadSource     - Called when user submits a custom path
 */
export default function AppHeader({ onHome, sourcePath, onSourceChange, onLoadSource }) {
  const isCustom = sourcePath === 'custom';

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') onLoadSource(e.target.value);
  };

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


      {/* Source selector */}
      <div className="flex items-center gap-3 bg-panel border border-border px-3 py-1.5 rounded-md">
        <label htmlFor="json-source-select" className="text-sm text-text-secondary font-medium whitespace-nowrap">
          데이터 소스:
        </label>
        <select
          id="json-source-select"
          value={sourcePath}
          onChange={(e) => onSourceChange(e.target.value)}
          className="bg-bg/80 text-text-primary border border-border px-3 py-1.5 rounded-sm text-sm font-sans cursor-pointer outline-none transition-colors hover:border-accent"
        >
          <option value="reports/compose_common_component/summary_daily/index.json">일별 리포트</option>
          <option value="reports/compose_common_component/summary_weekly/index.json">주간별 리포트</option>
          <option value="reports/compose_common_component/summary_monthly/index.json">월간별 리포트</option>
          <option value="reports/compose_common_component/summary_yearly/index.json">연간별 리포트</option>
          <option value="custom">직접 입력...</option>
        </select>

        {isCustom && (
          <>
            <input
              type="text"
              id="json-source-input"
              placeholder="파일명 입력 (예: reports/custom.json)"
              onKeyPress={handleKeyPress}
              className="bg-bg/80 text-text-primary border border-border px-3 py-1.5 rounded-sm text-sm font-sans outline-none w-52 transition-all focus:border-accent focus:shadow-accent-sm"
            />
            <button
              id="load-btn"
              onClick={() => {
                const input = document.getElementById('json-source-input');
                onLoadSource(input?.value?.trim());
              }}
              className="bg-accent hover:bg-accent-hover text-white px-4 py-1.5 rounded-sm text-sm font-semibold transition-all hover:shadow-accent-sm"
            >
              로드
            </button>
          </>
        )}
      </div>
    </header>
  );
}
