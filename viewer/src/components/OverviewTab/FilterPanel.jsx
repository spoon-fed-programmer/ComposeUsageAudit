/**
 * FilterPanel - Search input only.
 *
 * @param {object}   props
 * @param {string}   props.searchQuery
 * @param {Function} props.onSearchChange
 */
export default function FilterPanel({ searchQuery, onSearchChange }) {
  return (
    <div className="flex items-center gap-4 bg-[rgba(17,22,34,0.4)] border border-border px-4 py-4 rounded-md">
      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <svg
          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 fill-text-muted pointer-events-none"
          viewBox="0 0 24 24"
        >
          <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
        </svg>
        <input
          type="text"
          id="comp-search"
          placeholder="컴포넌트 또는 파일명 검색..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-bg/80 border border-border rounded-sm pl-10 pr-4 py-2.5 text-sm text-text-primary font-sans outline-none transition-all focus:border-accent focus:shadow-accent-sm"
        />
      </div>
    </div>
  );
}
