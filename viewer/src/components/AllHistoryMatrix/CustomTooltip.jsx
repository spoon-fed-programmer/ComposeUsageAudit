import { useI18n } from '../../contexts/I18nContext';

/**
 * CustomTooltip - Renders custom HTML tooltip card inside Recharts timeline.
 */
export default function CustomTooltip({ active, payload, label }) {
  const { t } = useI18n();

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
}
