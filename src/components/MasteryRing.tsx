'use client';

interface MasteryRingProps {
  /** 0–1 mastery fraction; values outside are clamped. */
  mastery: number;
  /** Pixel diameter of the ring. */
  size?: number;
  /** Stroke thickness in px. */
  strokeWidth?: number;
  color: string;
  trackColor?: string;
  /** Dim the arc (used when a subject has no attempts yet). */
  dim?: boolean;
  children?: React.ReactNode;
}

/**
 * Circular progress ring matching the Figma dashboard design.
 * The colored arc sweeps clockwise from 12 o'clock proportional to `mastery`.
 */
export default function MasteryRing({
  mastery,
  size = 127,
  strokeWidth = 14,
  color,
  trackColor = 'var(--ring-track)',
  dim = false,
  children,
}: MasteryRingProps) {
  const clamped = Math.min(1, Math.max(0, mastery));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  return (
    <div
      className="mastery-ring"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${Math.round(clamped * 100)}% mastery`}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        <circle
          className="mastery-ring-arc"
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={dim ? 'none' : color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - clamped)}
          transform={`rotate(-90 ${center} ${center})`}
        />
      </svg>
      {children != null && <div className="mastery-ring-content">{children}</div>}
    </div>
  );
}
