/**
 * AppHeader - Sticky top navigation bar.
 *
 * @param {object}   props
 * @param {Function} props.onHome           - Called when logo is clicked
 * @param {string}   props.sourcePath       - Currently selected JSON source path
 * @param {Function} props.onSourceChange   - Called when the dropdown changes
 * @param {Function} props.onLoadSource     - Called when user submits a custom path
 */
export default function AppHeader({ onHome }) {
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
    </header>
  );
}
