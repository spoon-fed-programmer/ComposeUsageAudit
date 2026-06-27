/**
 * EmptyState - Shown when no report has been selected yet, or an error occurs.
 *
 * @param {object} props
 * @param {string} [props.message]
 * @param {'default'|'error'} [props.variant]
 */
export default function EmptyState({ message = '리포트 이력에서 조회할 데이터를 선택해 주세요.', variant = 'default' }) {
  const isError = variant === 'error';

  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-text-muted">
      {isError ? (
        <svg className="w-16 h-16 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      ) : (
        <svg className="w-16 h-16 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      )}
      <p className={`text-lg whitespace-pre-line text-center leading-relaxed max-w-md ${isError ? 'text-danger' : ''}`}>
        {message}
      </p>
    </div>
  );
}
