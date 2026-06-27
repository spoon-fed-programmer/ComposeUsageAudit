/**
 * FileDetailPanel - Right-side detail view showing components and usage in a file.
 *
 * @param {object|null} props.fileData   - { pkgName, fileName, comps }
 * @param {boolean}     props.loading
 * @param {string|null} props.error
 */
export default function FileDetailPanel({ fileData, loading, error }) {
  if (loading) {
    return (
      <div className="bg-panel border border-border rounded-lg p-8 flex items-center justify-center min-h-[400px]">
        <div className="spinner" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-panel border border-border rounded-lg p-8 min-h-[400px]">
        <p className="text-danger font-semibold mb-3">파일 정보 로드 실패</p>
        <p className="text-sm text-text-secondary leading-relaxed">{error}</p>
      </div>
    );
  }

  if (!fileData) {
    return (
      <div className="bg-panel border border-border rounded-lg p-8 min-h-[400px] flex items-center justify-center text-text-muted">
        파일을 선택하세요.
      </div>
    );
  }

  const { pkgName, fileName, comps } = fileData;

  return (
    <div className="bg-panel border border-border rounded-lg px-8 py-8 flex flex-col gap-6 min-h-[400px]">
      {/* File header */}
      <div className="border-b border-border pb-5">
        <div className="text-sm text-text-secondary font-mono mb-1">패키지: {pkgName || 'N/A'}</div>
        <div className="text-2xl font-bold font-mono">{fileName}</div>
      </div>

      {/* Component cards */}
      <div className="flex flex-col gap-5">
        {comps.map((comp, idx) => {
          const isUnused = comp.count === 0;
          return (
            <div
              key={`${comp.name}-${idx}`}
              className="bg-card border border-border rounded-md p-5 flex flex-col gap-4 transition-colors hover:border-white/12"
            >
              {/* Card header */}
              <div className="flex justify-between items-center">
                <div className="text-lg font-semibold text-white flex items-center gap-3">
                  <span className="text-text-secondary font-normal">@Composable fun</span>
                  <strong>{comp.name}</strong>
                </div>
                <span className={[
                  'text-[11px] font-semibold px-2 py-1 rounded-full uppercase border',
                  isUnused
                    ? 'bg-[rgba(100,116,139,0.1)] text-text-secondary border-[rgba(100,116,139,0.2)]'
                    : 'bg-success-glow text-success border-[rgba(16,185,129,0.2)]',
                ].join(' ')}>
                  {isUnused ? 'unused' : 'active'}
                </span>
              </div>

              {/* Metrics row */}
              <div className="text-sm text-text-secondary">
                참조 횟수: <strong className="text-text-primary font-mono">{comp.count}</strong>회
              </div>

              {/* Usage list */}
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-text-muted mb-2">
                  호출 클래스 / 파일 위치
                </div>
                <div className="flex flex-col gap-1.5">
                  {isUnused ? (
                    <div className="text-sm text-text-muted italic py-1">
                      이 공통 컴포넌트는 프로젝트 내에서 호출된 이력이 없습니다.
                    </div>
                  ) : (
                    comp.classes.map((cls, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 bg-white/[0.03] border border-border px-3 py-2 rounded-sm font-mono text-sm text-text-secondary"
                      >
                        {/* Dot indicator */}
                        <span
                          className="inline-block w-1.5 h-1.5 rounded-full bg-accent shrink-0"
                          style={{ boxShadow: '0 0 6px #6366f1' }}
                        />
                        {cls}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
