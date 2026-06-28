/**
 * MetricsGrid - Displays two key numeric summary cards.
 *
 * @param {object} props
 * @param {number} props.total - Total component count
 * @param {number} props.refs  - Total reference count
 */
export default function MetricsGrid({ total, refs }) {
  return (
    <div className="grid grid-cols-2 gap-5 w-fit mx-auto" style={{ gridTemplateColumns: 'repeat(2, 200px)' }}>
      {/* Total components */}
      <div className="flex flex-col items-center gap-0.5 text-center rounded-md border border-accent/35 bg-accent/8 backdrop-blur-panel px-5 py-2 shadow-[0_0_25px_rgba(99,102,241,0.35)] transition-all hover:shadow-[0_0_30px_rgba(99,102,241,0.45)]">
        <span className="text-xs font-medium text-text-secondary">전체 컴포넌트</span>
        <span className="text-[22px] font-bold font-mono text-white" style={{ textShadow: '0 0 12px rgba(99,102,241,0.45), 0 0 4px rgba(99,102,241,0.25)' }}>
          {total}
        </span>
      </div>

      {/* Total references */}
      <div className="flex flex-col items-center gap-0.5 text-center rounded-md border border-success/35 bg-success/8 backdrop-blur-panel px-5 py-2 shadow-[0_0_25px_rgba(16,185,129,0.35)] transition-all hover:shadow-[0_0_30px_rgba(16,185,129,0.45)]">
        <span className="text-xs font-medium text-text-secondary">총 사용 참조 횟수</span>
        <span className="text-[22px] font-bold font-mono text-white" style={{ textShadow: '0 0 12px rgba(16,185,129,0.45), 0 0 4px rgba(16,185,129,0.25)' }}>
          {refs}
        </span>
      </div>
    </div>
  );
}
