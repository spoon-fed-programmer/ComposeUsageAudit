import { useState, useRef } from 'react';
import { formatTimestamp } from '../RunCard';
import { useI18n } from '../../contexts/I18nContext';

export default function HistoryTrendChart({ matrixData, reportRuns }) {
  const { t } = useI18n();
  const containerRef = useRef(null);
  const [hoverIdx, setHoverIdx] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // 1. Sort report runs from oldest to newest for linear progression
  const runs = [...reportRuns].reverse();

  if (runs.length === 0) return null;

  // 2. Setup sizing configurations
  const svgWidth = 800;
  const svgHeight = 200;
  const paddingLeft = 60;
  const paddingRight = 60;
  const paddingTop = 25;
  const paddingBottom = 35;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  // 3. Extract metrics per run
  const dataPoints = runs.map((run) => {
    // total_references
    const refs = run.summary ? run.summary.total_references : 0;
    // total_components
    const comps = run.summary ? run.summary.total_components : 0;

    return {
      timestamp: run.timestamp,
      refs,
      comps,
    };
  });

  // 4. Calculate maximum values to scale the axes
  const maxRefs = Math.max(...dataPoints.map((d) => d.refs), 10);
  const maxComps = Math.max(...dataPoints.map((d) => d.comps), 10);

  // Round up max bounds for clean axis grid divisions
  const roundedMaxRefs = Math.ceil(maxRefs / 10) * 10;
  const roundedMaxComps = Math.ceil(maxComps / 10) * 10;

  // 5. Generate coordinates
  const points = dataPoints.map((d, idx) => {
    const x = paddingLeft + (idx / (runs.length - 1 || 1)) * chartWidth;
    
    // Y1 (References) scaled to roundedMaxRefs
    const yRefs = svgHeight - paddingBottom - (d.refs / (roundedMaxRefs || 1)) * chartHeight;
    
    // Y2 (Components) scaled to roundedMaxComps
    const yComps = svgHeight - paddingBottom - (d.comps / (roundedMaxComps || 1)) * chartHeight;

    return { x, yRefs, yComps, ...d };
  });

  // Build SVG path lines
  const buildPath = (key) => {
    if (points.length === 0) return '';
    return points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p[key]}`).join(' ');
  };

  const buildAreaPath = (key) => {
    if (points.length === 0) return '';
    const linePath = buildPath(key);
    const firstX = points[0].x;
    const lastX = points[points.length - 1].x;
    const baseY = svgHeight - paddingBottom;
    return `${linePath} L ${lastX} ${baseY} L ${firstX} ${baseY} Z`;
  };

  const refsPath = buildPath('yRefs');
  const compsPath = buildPath('yComps');
  const refsAreaPath = buildAreaPath('yRefs');
  const compsAreaPath = buildAreaPath('yComps');

  // Handle hover index detection
  const handleMouseMove = (e) => {
    if (!containerRef.current || points.length === 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseXRelative = ((e.clientX - rect.left) / rect.width) * svgWidth;
    
    // Find closest point by X coordinate
    let closestIdx = 0;
    let minDiff = Infinity;
    points.forEach((p, idx) => {
      const diff = Math.abs(p.x - mouseXRelative);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = idx;
      }
    });

    setHoverIdx(closestIdx);

    // Compute absolute tooltip placement
    setTooltipPos({
      x: e.clientX - rect.left + 15,
      y: e.clientY - rect.top - 70,
    });
  };

  const handleMouseLeave = () => {
    setHoverIdx(null);
  };

  const activePoint = hoverIdx !== null ? points[hoverIdx] : null;

  return (
    <div className="bg-panel border border-border rounded-lg p-5 flex flex-col gap-3 relative select-none">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider font-sans">
          {t('history_trend_chart_title', '이력 트렌드 추이')}
        </h3>
        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-sans">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1.5 rounded-sm bg-accent inline-block" />
            <span className="text-text-secondary">{t('total_references')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1.5 rounded-sm bg-success inline-block" />
            <span className="text-text-secondary">{t('total_components')}</span>
          </div>
        </div>
      </div>

      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="w-full relative cursor-crosshair overflow-visible"
        style={{ height: `${svgHeight}px` }}
      >
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-full overflow-visible"
        >
          <defs>
            {/* Gradients */}
            <linearGradient id="refsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="compsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
            {/* Glow Filters */}
            <filter id="glowRefs" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#6366f1" floodOpacity="0.5" />
            </filter>
            <filter id="glowComps" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#10b981" floodOpacity="0.5" />
            </filter>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
            const y = paddingTop + pct * chartHeight;
            return (
              <line
                key={idx}
                x1={paddingLeft}
                y1={y}
                x2={svgWidth - paddingRight}
                y2={y}
                className="stroke-border/40"
                strokeWidth={1}
                strokeDasharray="4 4"
              />
            );
          })}

          {/* Left Y-axis (References) Labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
            const value = Math.round(roundedMaxRefs * (1 - pct));
            const y = paddingTop + pct * chartHeight;
            return (
              <text
                key={idx}
                x={paddingLeft - 10}
                y={y + 4}
                className="fill-text-muted font-mono text-[9px] text-right font-semibold"
                textAnchor="end"
              >
                {value.toLocaleString()}
              </text>
            );
          })}

          {/* Right Y-axis (Components) Labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
            const value = Math.round(roundedMaxComps * (1 - pct));
            const y = paddingTop + pct * chartHeight;
            return (
              <text
                key={idx}
                x={svgWidth - paddingRight + 10}
                y={y + 4}
                className="fill-text-muted font-mono text-[9px] text-left font-semibold"
                textAnchor="start"
              >
                {value.toLocaleString()}
              </text>
            );
          })}

          {/* X-axis Labels (Timeline dates) */}
          {points.map((p, idx) => {
            // Show every Nth label to prevent overlapping if timeline is long
            const interval = Math.ceil(runs.length / 8) || 1;
            if (idx % interval !== 0 && idx !== runs.length - 1) return null;
            
            const dateStr = formatTimestamp(p.timestamp, t);
            return (
              <g key={idx}>
                <line
                  x1={p.x}
                  y1={svgHeight - paddingBottom}
                  x2={p.x}
                  y2={svgHeight - paddingBottom + 5}
                  className="stroke-border/60"
                  strokeWidth={1}
                />
                <text
                  x={p.x}
                  y={svgHeight - paddingBottom + 16}
                  className="fill-text-muted font-sans text-[10px] text-center"
                  textAnchor="middle"
                >
                  {dateStr}
                </text>
              </g>
            );
          })}

          {/* Base bottom border */}
          <line
            x1={paddingLeft}
            y1={svgHeight - paddingBottom}
            x2={svgWidth - paddingRight}
            y2={svgHeight - paddingBottom}
            className="stroke-border/80"
            strokeWidth={1}
          />

          {/* Gradient Areas */}
          <path d={refsAreaPath} fill="url(#refsGradient)" className="pointer-events-none" />
          <path d={compsAreaPath} fill="url(#compsGradient)" className="pointer-events-none" />

          {/* Lines */}
          <path
            d={refsPath}
            fill="none"
            stroke="#6366f1"
            strokeWidth={2.5}
            filter="url(#glowRefs)"
            className="pointer-events-none"
          />
          <path
            d={compsPath}
            fill="none"
            stroke="#10b981"
            strokeWidth={2.5}
            filter="url(#glowComps)"
            className="pointer-events-none"
          />

          {/* Dots on line */}
          {points.map((p, idx) => {
            const isHovered = hoverIdx === idx;
            return (
              <g key={idx} className="pointer-events-none">
                {/* References points */}
                <circle
                  cx={p.x}
                  cy={p.yRefs}
                  r={isHovered ? 5.5 : 3.5}
                  className="fill-accent stroke-accent/30"
                  strokeWidth={isHovered ? 4 : 1}
                />
                {/* Components points */}
                <circle
                  cx={p.x}
                  cy={p.yComps}
                  r={isHovered ? 5.5 : 3.5}
                  className="fill-success stroke-success/30"
                  strokeWidth={isHovered ? 4 : 1}
                />
              </g>
            );
          })}

          {/* Hover Guide line */}
          {activePoint && (
            <line
              x1={activePoint.x}
              y1={paddingTop}
              x2={activePoint.x}
              y2={svgHeight - paddingBottom}
              className="stroke-accent/40 pointer-events-none"
              strokeWidth={1.5}
              strokeDasharray="3 3"
            />
          )}
        </svg>

        {/* Floating Tooltip */}
        {activePoint && (
          <div
            className="absolute z-30 bg-card/95 border border-accent/40 rounded px-3 py-2 text-xs font-sans shadow-lg flex flex-col gap-1 backdrop-blur-md transition-all duration-100 ease-out select-none min-w-[130px] pointer-events-none"
            style={{
              left: `${tooltipPos.x}px`,
              top: `${tooltipPos.y}px`,
            }}
          >
            <div className="font-semibold text-white border-b border-border/60 pb-1 mb-1">
              {formatTimestamp(activePoint.timestamp, t)}
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-text-muted">{t('total_references')}</span>
              <span className="font-mono text-accent font-bold">
                {activePoint.refs.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-text-muted">{t('total_components')}</span>
              <span className="font-mono text-success font-bold">
                {activePoint.comps.toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
