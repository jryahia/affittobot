import { useEffect, useState } from "react";

const RADIUS = 45;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
// Gauge uses 75% of the circle (270 degrees)
const ARC = CIRCUMFERENCE * 0.75;

function scoreColor(score) {
  if (score <= 3) return { stroke: "#DC2626", text: "#DC2626", bg: "#FEF2F2", label: "Molto sfavorevole" };
  if (score <= 5) return { stroke: "#F97316", text: "#EA580C", bg: "#FFF7ED", label: "Sfavorevole" };
  if (score <= 7) return { stroke: "#EAB308", text: "#CA8A04", bg: "#FEFCE8", label: "Nella media" };
  return { stroke: "#16A34A", text: "#15803D", bg: "#F0FDF4", label: "Favorevole" };
}

export default function ScoreGauge({ score }) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(t);
  }, []);

  const clamped = Math.min(Math.max(score, 1), 10);
  const colors = scoreColor(clamped);

  // Offset: full arc = score 10 → offset 0, empty = score 0 → offset ARC
  const fillRatio = (clamped - 1) / 9;
  const targetOffset = ARC - fillRatio * ARC;
  const currentOffset = animated ? targetOffset : ARC;

  // Gauge starts from bottom-left (225°) and sweeps clockwise to bottom-right (315°)
  const startAngle = 135;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const cx = 50;
  const cy = 50;

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="relative rounded-3xl p-6 shadow-lg"
        style={{ background: colors.bg, border: `2px solid ${colors.stroke}22` }}
      >
        <svg
          viewBox="0 0 100 100"
          className="w-48 h-48 md:w-56 md:h-56"
          aria-label={`Score contratto: ${clamped} su 10`}
        >
          {/* Background track arc */}
          <circle
            cx={cx}
            cy={cy}
            r={RADIUS}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="8"
            strokeDasharray={`${ARC} ${CIRCUMFERENCE}`}
            strokeDashoffset="0"
            strokeLinecap="round"
            transform={`rotate(${startAngle} ${cx} ${cy})`}
          />

          {/* Filled arc */}
          <circle
            cx={cx}
            cy={cy}
            r={RADIUS}
            fill="none"
            stroke={colors.stroke}
            strokeWidth="8"
            strokeDasharray={`${ARC} ${CIRCUMFERENCE}`}
            strokeDashoffset={currentOffset}
            strokeLinecap="round"
            transform={`rotate(${startAngle} ${cx} ${cy})`}
            style={{
              transition: animated ? "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)" : "none",
            }}
          />

          {/* Score number */}
          <text
            x={cx}
            y={cy - 4}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="22"
            fontWeight="800"
            fill={colors.text}
            fontFamily="system-ui, sans-serif"
          >
            {clamped}
          </text>

          {/* "/10" label */}
          <text
            x={cx}
            y={cy + 14}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="10"
            fontWeight="500"
            fill="#9ca3af"
            fontFamily="system-ui, sans-serif"
          >
            /10
          </text>
        </svg>
      </div>

      {/* Label below gauge */}
      <div className="text-center">
        <span
          className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold"
          style={{
            background: colors.bg,
            color: colors.text,
            border: `1px solid ${colors.stroke}44`,
          }}
        >
          {colors.label}
        </span>
        <p className="mt-2 text-xs text-gray-500">
          Score basato su clausole, prezzo e condizioni
        </p>
      </div>

      {/* Score legend */}
      <div className="flex gap-4 text-xs text-gray-500">
        {[
          { range: "1–3", color: "#DC2626", label: "Sfavorevole" },
          { range: "4–7", color: "#EAB308", label: "Medio" },
          { range: "8–10", color: "#16A34A", label: "Favorevole" },
        ].map(({ range, color, label }) => (
          <div key={range} className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
            <span>
              {range}: {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
