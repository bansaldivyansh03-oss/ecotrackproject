"use client";

interface GrowthRingProps {
  score: number; // 0-100
  size?: number;
}

export default function GrowthRing({ score, size = 176 }: GrowthRingProps) {
  const rings = [
    { r: size * 0.46, width: 6, color: "var(--lichen)", weight: 0.55 },
    { r: size * 0.37, width: 7, color: "var(--moss)", weight: 0.75 },
    { r: size * 0.28, width: 8, color: "var(--moss-light)", weight: 1 },
  ];
  const center = size / 2;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        {rings.map((ring, i) => {
          const circumference = 2 * Math.PI * ring.r;
          const filled = (score / 100) * ring.weight;
          const offset = circumference * (1 - filled);
          return (
            <g key={i}>
              <circle
                cx={center}
                cy={center}
                r={ring.r}
                fill="none"
                stroke="var(--border-soft)"
                strokeWidth={ring.width}
              />
              <circle
                cx={center}
                cy={center}
                r={ring.r}
                fill="none"
                stroke={ring.color}
                strokeWidth={ring.width}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference}
                className="ring-animate"
                style={
                  {
                    "--ring-circumference": circumference,
                    "--ring-offset": offset,
                    animationDelay: `${i * 0.15}s`,
                  } as React.CSSProperties
                }
              />
            </g>
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-4xl font-semibold tracking-tight">{score}</span>
        <span className="text-[11px] uppercase tracking-wider text-foreground-soft">
          Carbon Score
        </span>
      </div>
    </div>
  );
}
