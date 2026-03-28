import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

interface DataPoint {
  x: number;
  y: number;
}

interface AnimatedGraphProps {
  data: DataPoint[];
  width?: number;
  height?: number;
  color?: string;
  label?: string;
  xLabel?: string;
  yLabel?: string;
  showDots?: boolean;
}

export default function AnimatedGraph({
  data,
  width = 500,
  height = 300,
  color = 'rgba(100, 220, 255, 0.9)',
  label = '',
  xLabel = '',
  yLabel = '',
  showDots = true,
}: AnimatedGraphProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { amount: 0.5, once: true });

  const padding = { top: 30, right: 30, bottom: 40, left: 50 };
  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;

  const xMin = Math.min(...data.map(d => d.x));
  const xMax = Math.max(...data.map(d => d.x));
  const yMin = Math.min(...data.map(d => d.y));
  const yMax = Math.max(...data.map(d => d.y));

  const toSvgX = (x: number) => padding.left + ((x - xMin) / (xMax - xMin || 1)) * plotW;
  const toSvgY = (y: number) => padding.top + plotH - ((y - yMin) / (yMax - yMin || 1)) * plotH;

  const pathD = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${toSvgX(d.x)} ${toSvgY(d.y)}`).join(' ');

  return (
    <div ref={ref} className="cosmic-card inline-block">
      {label && (
        <p className="text-sm font-display text-muted-foreground mb-3">{label}</p>
      )}
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="max-w-full h-auto">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map(frac => (
          <line
            key={`h-${frac}`}
            x1={padding.left}
            y1={padding.top + plotH * frac}
            x2={padding.left + plotW}
            y2={padding.top + plotH * frac}
            stroke="rgba(100,200,255,0.07)"
            strokeWidth="0.5"
          />
        ))}

        {/* Axes */}
        <line
          x1={padding.left} y1={padding.top + plotH}
          x2={padding.left + plotW} y2={padding.top + plotH}
          stroke="rgba(100,200,255,0.2)" strokeWidth="1"
        />
        <line
          x1={padding.left} y1={padding.top}
          x2={padding.left} y2={padding.top + plotH}
          stroke="rgba(100,200,255,0.2)" strokeWidth="1"
        />

        {/* Axis labels */}
        {xLabel && (
          <text x={padding.left + plotW / 2} y={height - 5} textAnchor="middle" fill="rgba(150,180,220,0.6)" fontSize="11" fontFamily="Space Grotesk">{xLabel}</text>
        )}
        {yLabel && (
          <text x={12} y={padding.top + plotH / 2} textAnchor="middle" fill="rgba(150,180,220,0.6)" fontSize="11" fontFamily="Space Grotesk" transform={`rotate(-90, 12, ${padding.top + plotH / 2})`}>{yLabel}</text>
        )}

        {/* Animated line */}
        <motion.path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
          transition={{ duration: 2, ease: 'easeOut' }}
        />

        {/* Glow line */}
        <motion.path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.15}
          initial={{ pathLength: 0 }}
          animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
          transition={{ duration: 2, ease: 'easeOut' }}
        />

        {/* Dots */}
        {showDots && data.map((d, i) => (
          <motion.circle
            key={i}
            cx={toSvgX(d.x)}
            cy={toSvgY(d.y)}
            r="3.5"
            fill={color}
            initial={{ opacity: 0, scale: 0 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
            transition={{ duration: 0.3, delay: (i / data.length) * 2 }}
          />
        ))}
      </svg>
    </div>
  );
}
