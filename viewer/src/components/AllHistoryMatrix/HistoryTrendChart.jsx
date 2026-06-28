import { useMemo } from 'react';
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { formatTimestamp } from '../RunCard';
import { useI18n } from '../../contexts/I18nContext';

export default function HistoryTrendChart({ matrixData, reportRuns }) {
  const { t } = useI18n();

  // 최신 데이터가 좌측으로 나오도록 reportRuns 순서(최신순)를 그대로 활용
  const data = useMemo(() => {
    return reportRuns.map((run) => {
      const refs = run.summary ? run.summary.total_references : 0;
      const comps = run.summary ? run.summary.total_components : 0;
      return {
        name: formatTimestamp(run.timestamp, t),
        refs,
        comps,
      };
    });
  }, [reportRuns, t]);

  if (data.length === 0) return null;

  // X축 데이터가 많을 경우 촘촘하지 않도록 최소 110px의 가로 너비 보장
  const minWidthPerRun = 110;
  const chartWidth = Math.max(800, data.length * minWidthPerRun);

  // Custom tooltips matching our premium dark theme
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card/95 border border-border/80 rounded px-3.5 py-2.5 text-xs font-sans shadow-lg flex flex-col gap-1.5 backdrop-blur-md">
          <div className="font-semibold text-white border-b border-border/60 pb-1.5 mb-1">
            {label}
          </div>
          <div className="flex justify-between gap-5">
            <span className="text-text-muted">{t('total_references')}</span>
            <span className="font-mono text-accent font-bold">
              {payload[0].value.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between gap-5">
            <span className="text-text-muted">{t('total_components')}</span>
            <span className="font-mono text-success font-bold">
              {payload[1].value.toLocaleString()}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-panel border border-border rounded-lg p-5 flex flex-col gap-3 relative select-none">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider font-sans">
          {t('history_trend_chart_title', '이력 트렌드 추이')}
        </h3>
      </div>

      {/* 가로 스크롤 컨테이너 */}
      <div className="overflow-x-auto w-full custom-scrollbar pb-2">
        <div style={{ width: `${chartWidth}px`, height: '220px' }}>
          <ComposedChart
            width={chartWidth}
            height={220}
            data={data}
            margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
          >
            <defs>
              {/* Glow Filters */}
              <filter id="glowRefs" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#6366f1" floodOpacity="0.5" />
              </filter>
              <filter id="glowComps" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#10b981" floodOpacity="0.5" />
              </filter>
            </defs>

            <CartesianGrid stroke="#1e293b" strokeDasharray="4 4" />

            <XAxis
              dataKey="name"
              stroke="#475569"
              tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'sans-serif' }}
              tickLine={false}
              dy={5}
            />

            {/* Y1 (References) - Left Axis */}
            <YAxis
              yAxisId="left"
              stroke="#6366f1"
              orientation="left"
              tickFormatter={(v) => v.toLocaleString()}
              tick={{ fill: '#6366f1', fontSize: 9, fontFamily: 'monospace', fontWeight: 'bold' }}
              tickLine={false}
              dx={-5}
            />

            {/* Y2 (Components) - Right Axis */}
            <YAxis
              yAxisId="right"
              stroke="#10b981"
              orientation="right"
              tickFormatter={(v) => v.toLocaleString()}
              tick={{ fill: '#10b981', fontSize: 9, fontFamily: 'monospace', fontWeight: 'bold' }}
              tickLine={false}
              dx={5}
            />

            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '3 3' }} />

            <Legend
              verticalAlign="top"
              height={36}
              content={(props) => {
                const { payload } = props;
                return (
                  <div className="flex items-center justify-end gap-4 text-xs font-sans mb-4">
                    {payload.map((entry, index) => {
                      const isRefs = entry.value === 'refs';
                      const colorClass = isRefs ? 'bg-accent' : 'bg-success';
                      const label = isRefs ? t('total_references') : t('total_components');
                      return (
                        <div key={`item-${index}`} className="flex items-center gap-1.5">
                          <span className={`w-3 h-1.5 rounded-sm ${colorClass} inline-block`} />
                          <span className="text-text-secondary">{label}</span>
                        </div>
                      );
                    })}
                  </div>
                );
              }}
            />

            <Line
              yAxisId="left"
              type="monotone"
              dataKey="refs"
              stroke="#6366f1"
              strokeWidth={3}
              dot={{ r: 3.5, fill: '#6366f1', stroke: 'rgba(99,102,241,0.3)', strokeWidth: 3 }}
              activeDot={{ r: 5, fill: '#6366f1', stroke: 'rgba(99,102,241,0.5)', strokeWidth: 4 }}
              filter="url(#glowRefs)"
            />

            <Line
              yAxisId="right"
              type="monotone"
              dataKey="comps"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ r: 3.5, fill: '#10b981', stroke: 'rgba(16,185,129,0.3)', strokeWidth: 3 }}
              activeDot={{ r: 5, fill: '#10b981', stroke: 'rgba(16,185,129,0.5)', strokeWidth: 4 }}
              filter="url(#glowComps)"
            />
          </ComposedChart>
        </div>
      </div>
    </div>
  );
}
