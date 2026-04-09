interface Props {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
}

export default function DonutChart({
  percentage,
  size = 64,
  strokeWidth = 7,
  color = '#22c55e',
  trackColor = '#e5e7eb',
}: Props) {
  const r = (size - strokeWidth * 2) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const dashOffset = circumference * (1 - Math.min(percentage, 100) / 100);

  const textSize = Math.round(size * 0.22);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="flex-shrink-0">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={trackColor} strokeWidth={strokeWidth} />
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`}
        style={{ transition: 'stroke-dashoffset 0.5s ease' }}
      />
      <text
        x={cx}
        y={cy + Math.round(textSize * 0.38)}
        textAnchor="middle"
        fontSize={textSize}
        fontWeight="700"
        fill="currentColor"
        className="text-gray-700 dark:text-gray-200"
      >
        {percentage}%
      </text>
    </svg>
  );
}
