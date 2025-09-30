"use client";

import clsx from "clsx";

export interface PieChartData {
  label: string;
  value: number;
  color: string;
}

interface PieChartProps {
  data: PieChartData[];
  size?: number;
  thickness?: number;
  centralLabel?: {
    title?: string;
    value?: string;
    subtitle?: string;
  };
  className?: string;
}

export function PieChart({
  data,
  size = 180,
  thickness = 22,
  centralLabel,
  className,
}: PieChartProps) {
  const total = data.reduce((sum, segment) => sum + segment.value, 0);
  const radius = size / 2 - thickness / 2;
  const circumference = 2 * Math.PI * radius;
  let cumulative = 0;
  const showSegments = total > 0;

  return (
    <div
      className={clsx("relative flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label="Gráfico de pizza"
      >
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#e2e8f0"
            strokeWidth={thickness}
          />
          {showSegments &&
            data.map((segment) => {
              const segmentLength =
                total === 0 ? 0 : (segment.value / total) * circumference;
              const dashArray = `${segmentLength} ${circumference}`;
              const dashOffset = circumference - cumulative;
              cumulative += segmentLength;
              return (
                <circle
                  key={segment.label}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke={segment.color}
                  strokeWidth={thickness}
                  strokeDasharray={dashArray}
                  strokeDashoffset={dashOffset}
                  strokeLinecap="butt"
                />
              );
            })}
        </g>
      </svg>
      {centralLabel && (
        <div className="absolute flex flex-col items-center text-center">
          {centralLabel.title && (
            <span className="text-[0.65rem] uppercase tracking-wide text-slate-400">
              {centralLabel.title}
            </span>
          )}
          {centralLabel.value && (
            <span className="text-xl font-semibold text-slate-900">
              {centralLabel.value}
            </span>
          )}
          {centralLabel.subtitle && (
            <span className="text-[0.65rem] text-slate-400">
              {centralLabel.subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
