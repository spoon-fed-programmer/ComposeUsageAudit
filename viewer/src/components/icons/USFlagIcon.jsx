/**
 * 미국 국기 (성조기) — 실제 비율 기준 SVG
 * viewBox 60x40 (3:2 비율), 13개 스트라이프 + 유니온(청색 사각) + 50개 별 표현
 */
export function USFlagIcon({ className = "h-4 w-4", size, ...props }) {
  const s = size ?? undefined;
  // 13 stripes: alternating red/white, each stripe height = 40/13 ≈ 3.077
  const stripeH = 40 / 13;
  const stripes = Array.from({ length: 13 }, (_, i) => ({
    y: i * stripeH,
    fill: i % 2 === 0 ? "#B22234" : "#FFFFFF",
  }));

  // Star rows in the union canton (26×20 area)
  const unionW = 26;
  const unionH = 20; // top 20px (half height)
  const starRows = [6, 5, 6, 5, 6, 5, 6, 5, 6]; // 9 rows
  const starCols = starRows.map((n) => n);
  const rowH = unionH / 9;

  return (
    <svg
      viewBox="0 0 60 40"
      className={className}
      width={s}
      height={s}
      aria-hidden
      {...props}
    >
      <defs>
        <clipPath id="kr-flag-clip">
          <rect width="60" height="40" rx="3" />
        </clipPath>
      </defs>

      <g clipPath="url(#kr-flag-clip)">
        {/* 13 alternating stripes */}
        {stripes.map((stripe, i) => (
          <rect key={i} x="0" y={stripe.y} width="60" height={stripeH} fill={stripe.fill} />
        ))}

        {/* Union canton — blue rectangle covering top-left 7 stripes */}
        <rect x="0" y="0" width={unionW} height={stripeH * 7} fill="#3C3B6E" />

        {/* Stars — simplified as small white circles in a grid */}
        {starCols.map((count, row) => {
          const isOddRow = row % 2 === 1; // offset rows have 5 stars
          const colW = unionW / (count + (isOddRow ? 1 : 0));
          const cy = rowH * row + rowH / 2;
          return Array.from({ length: count }, (_, col) => {
            const cx = isOddRow
              ? colW + col * colW
              : colW / 2 + col * colW;
            return (
              <circle key={`${row}-${col}`} cx={cx} cy={cy} r={0.7} fill="#FFFFFF" />
            );
          });
        })}
      </g>

      {/* 테두리 */}
      <rect width="60" height="40" rx="3" fill="none" stroke="#D1D5DB" strokeWidth="0.5" />
    </svg>
  );
}
