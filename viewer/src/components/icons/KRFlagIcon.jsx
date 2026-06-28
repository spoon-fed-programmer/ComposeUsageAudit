/**
 * 대한민국 국기 (태극기) — 실제 비율 기준 SVG
 * viewBox 60x40 (3:2 비율), 태극 + 4괘 정확 배치
 */
export function KRFlagIcon({ className = "h-4 w-4", size, ...props }) {
  const s = size ?? undefined;
  return (
    <svg
      viewBox="0 0 60 40"
      className={className}
      width={s}
      height={s}
      aria-hidden
      {...props}
    >
      {/* 흰 바탕 */}
      <rect width="60" height="40" rx="3" fill="#fff" />

      {/* ── 태극 (Taegeuk) ── */}
      {/* 전체 원 (빨간색) */}
      <circle cx="30" cy="20" r="10" fill="#CD2E3A" />
      {/* 아래 반원 (파란색) */}
      <path d="M30 10 a10 10 0 0 0 0 20 a5 5 0 0 1 0-10 a5 5 0 0 0 0-10z" fill="#0047A0" />
      {/* 위 작은 원 (빨간색) */}
      <circle cx="30" cy="15" r="5" fill="#CD2E3A" />
      {/* 아래 작은 원 (파란색) */}
      <circle cx="30" cy="25" r="5" fill="#0047A0" />

      {/* ── 4괘 (Trigrams) — 실제 막대 3줄씩 ── */}
      {/* 건 ☰ (좌상단, 45° 회전) — 세 줄 모두 연결 */}
      <g transform="rotate(-45 13.5 9)" stroke="#000" strokeWidth="1.6" strokeLinecap="round">
        <line x1="10" y1="7"  x2="17" y2="7" />
        <line x1="10" y1="9"  x2="17" y2="9" />
        <line x1="10" y1="11" x2="17" y2="11" />
      </g>

      {/* 이 ☲ (우상단, 45° 회전) — 가운데 줄 끊김 */}
      <g transform="rotate(45 46.5 9)" stroke="#000" strokeWidth="1.6" strokeLinecap="round">
        <line x1="43" y1="7"  x2="50" y2="7" />
        <line x1="43" y1="9"  x2="46" y2="9" />
        <line x1="47" y1="9"  x2="50" y2="9" />
        <line x1="43" y1="11" x2="50" y2="11" />
      </g>

      {/* 감 ☵ (좌하단, 45° 회전) — 위아래 줄 끊김 */}
      <g transform="rotate(45 13.5 31)" stroke="#000" strokeWidth="1.6" strokeLinecap="round">
        <line x1="10" y1="29" x2="13" y2="29" />
        <line x1="14" y1="29" x2="17" y2="29" />
        <line x1="10" y1="31" x2="17" y2="31" />
        <line x1="10" y1="33" x2="13" y2="33" />
        <line x1="14" y1="33" x2="17" y2="33" />
      </g>

      {/* 곤 ☷ (우하단, 45° 회전) — 세 줄 모두 끊김 */}
      <g transform="rotate(-45 46.5 31)" stroke="#000" strokeWidth="1.6" strokeLinecap="round">
        <line x1="43" y1="29" x2="46" y2="29" />
        <line x1="47" y1="29" x2="50" y2="29" />
        <line x1="43" y1="31" x2="46" y2="31" />
        <line x1="47" y1="31" x2="50" y2="31" />
        <line x1="43" y1="33" x2="46" y2="33" />
        <line x1="47" y1="33" x2="50" y2="33" />
      </g>

      {/* 모서리 라운드 클립 테두리 */}
      <rect width="60" height="40" rx="3" fill="none" stroke="#D1D5DB" strokeWidth="0.5" />
    </svg>
  );
}
