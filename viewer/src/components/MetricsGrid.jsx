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
      <div className="flex flex-col items-center gap-0.5 text-center rounded-md border border-accent/25 bg-accent/4 backdrop-blur-panel px-5 py-2 shadow-accent">
        <span className="text-xs font-medium text-text-secondary">전체 컴포넌트</span>
        <span className="text-[22px] font-bold font-mono text-white" style={{ textShadow: '0 0 10px rgba(99,102,241,0.25)' }}>
          {total}
        </span>
      </div>

      {/* Total references */}
      <div className="flex flex-col items-center gap-0.5 text-center rounded-md border border-warning/25 bg-warning/[0.02] backdrop-blur-panel px-5 py-2 shadow-warning">
        <span className="text-xs font-medium text-text-secondary">총 사용 참조 횟수</span>
        <span className="text-[22px] font-bold font-mono text-warning" style={{ textShadow: '0 0 10px rgba(245,158,11,0.2)' }}>
          {refs}
        </span>
      </div>
    </div>
  );
}
