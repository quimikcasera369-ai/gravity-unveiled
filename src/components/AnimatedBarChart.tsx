import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

interface Bar {
  label: string;
  value: number;
  color?: string;
}

interface AnimatedBarChartProps {
  bars: Bar[];
  height?: number;
  label?: string;
}

export default function AnimatedBarChart({ bars, height = 200, label }: AnimatedBarChartProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { amount: 0.5, once: true });
  const maxVal = Math.max(...bars.map(b => b.value));

  return (
    <div ref={ref} className="cosmic-card">
      {label && <p className="text-sm font-display text-muted-foreground mb-4">{label}</p>}
      <div className="flex items-end gap-2" style={{ height }}>
        {bars.map((bar, i) => (
          <div key={i} className="flex flex-col items-center flex-1">
            <motion.div
              className="w-full rounded-t"
              style={{
                background: bar.color || 'hsl(187, 80%, 55%)',
                boxShadow: `0 0 10px ${bar.color || 'hsl(187, 80%, 55%)'}40`,
              }}
              initial={{ height: 0 }}
              animate={isInView ? { height: `${(bar.value / maxVal) * (height - 30)}px` } : { height: 0 }}
              transition={{ duration: 0.6, delay: i * 0.05, ease: 'easeOut' }}
            />
            <span className="text-[10px] text-muted-foreground mt-1 truncate w-full text-center">
              {bar.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
