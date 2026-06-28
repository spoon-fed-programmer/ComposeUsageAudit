import { useState } from 'react';

/**
 * ClassUsageList - Compact list component that renders called classes with pagination (load more).
 * Lists all usage lines in a single compact row instead of double-height layouts.
 */
export default function ClassUsageList({
  classes,
  refsSuffix,
  unusedMsg,
}) {
  const [visibleCount, setVisibleCount] = useState(20);

  if (!classes || classes.length === 0) {
    return (
      <div className="text-xs text-text-muted italic py-1 select-none">
        {unusedMsg}
      </div>
    );
  }

  const handleLoadMore = (e) => {
    e.preventDefault();
    setVisibleCount((prev) => prev + 20);
  };

  const visibleClasses = classes.slice(0, visibleCount);
  const hasMore = classes.length > visibleCount;

  return (
    <div className="flex flex-col gap-1.5">
      {visibleClasses.map((cls, i) => {
        const isObj = cls && typeof cls === 'object';
        const classNameStr = isObj ? cls.class_name : cls;
        
        // Extract ref count
        const rawRefCount = isObj ? cls.count : cls.total_count;
        const refCount = (rawRefCount !== null && typeof rawRefCount === 'number' && !isNaN(rawRefCount))
          ? rawRefCount
          : null;
        
        // Extract line numbers
        const lineNumbers = isObj && Array.isArray(cls.lines) ? cls.lines : [];

        // Extract module name / source set info
        const moduleInfo = isObj
          ? [cls.module_name, cls.source_set].filter(Boolean).join('/')
          : null;

        return (
          <div
            key={i}
            className="flex items-center justify-between gap-4 bg-white/[0.02] border border-border/30 px-3.5 py-1.5 rounded-sm font-mono text-xs text-text-secondary hover:bg-white/[0.04] transition-colors"
          >
            {/* Left: bullet, class name, and module source info */}
            <div className="flex items-center gap-2 truncate">
              <span
                className="inline-block w-1.5 h-1.5 rounded-full bg-accent shrink-0 animate-pulse"
                style={{ boxShadow: '0 0 6px #6366f1' }}
              />
              <span className="truncate text-text-secondary flex items-center gap-1.5" title={classNameStr}>
                {cls.isNew && (
                  <span
                    className="text-[8px] font-extrabold text-[#f43f5e] bg-[#f43f5e]/15 border border-[#f43f5e]/30 px-1 py-0.5 rounded-sm shrink-0 select-none font-sans tracking-wide"
                    style={{ textShadow: '0 0 4px rgba(244,63,94,0.4)', boxShadow: '0 0 6px rgba(244,63,94,0.1)' }}
                  >
                    NEW
                  </span>
                )}
                <span className="truncate text-white font-medium">{classNameStr}</span>
                {moduleInfo && (
                  <span className="text-[10px] text-text-muted opacity-60 font-sans font-normal shrink-0 select-none">
                    ({moduleInfo})
                  </span>
                )}
              </span>
            </div>

            {/* Right: line number badges & reference badge */}
            <div className="flex items-center gap-2 shrink-0 select-none">
              {/* Line badges rendered inline */}
              {lineNumbers.length > 0 && (
                <div className="flex items-center gap-1 max-w-[180px] overflow-hidden flex-wrap justify-end">
                  {lineNumbers.map((ln) => (
                    <span
                      key={ln}
                      className="text-accent bg-accent/10 border border-accent/20 px-1 py-0.5 rounded-sm text-[9px] font-bold shrink-0"
                    >
                      L{ln}
                    </span>
                  ))}
                </div>
              )}

              {/* Reference count Badge */}
              {refCount !== null && (
                <span className="text-[9px] font-semibold text-text-muted bg-white/[0.05] border border-border px-1.5 py-0.5 rounded-sm shrink-0">
                  {refCount.toLocaleString()}{refsSuffix}
                </span>
              )}
            </div>
          </div>
        );
      })}

      {/* Load More Button */}
      {hasMore && (
        <button
          onClick={handleLoadMore}
          className="mt-1 px-3 py-1.5 rounded bg-white/[0.04] hover:bg-white/[0.08] border border-border text-center text-xs font-semibold text-text-secondary hover:text-white transition-all cursor-pointer select-none outline-none"
        >
          {`더 보기 (Load More) +${classes.length - visibleCount}`}
        </button>
      )}
    </div>
  );
}
