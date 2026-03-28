import { useState } from 'react';
import { motion } from 'framer-motion';

interface InteractivePanelProps {
  className?: string;
}

export default function InteractivePanel({ className = '' }: InteractivePanelProps) {
  const [mass, setMass] = useState(10);
  const [redshift, setRedshift] = useState(0);
  const [mode, setMode] = useState<'newtonian' | 'emergent'>('newtonian');

  // Simulate rotation curve data
  const generateCurve = () => {
    const points: { r: number; v: number }[] = [];
    for (let r = 0.5; r <= 10; r += 0.3) {
      let v: number;
      if (mode === 'newtonian') {
        v = Math.sqrt(mass / r) * (1 - redshift * 0.05);
      } else {
        const gCrit = 1.2e-10 * (1 + redshift * 0.12);
        const gNewton = mass / (r * r);
        v = gNewton > gCrit
          ? Math.sqrt(mass / r)
          : Math.pow(mass * gCrit, 0.25) * Math.sqrt(r / (r + 1));
        v *= (1 + redshift * 0.03);
      }
      points.push({ r, v });
    }
    return points;
  };

  const curve = generateCurve();
  const maxV = Math.max(...curve.map(p => p.v));
  const svgW = 400;
  const svgH = 200;
  const pad = 40;
  const plotW = svgW - pad * 2;
  const plotH = svgH - pad * 2;

  const pathD = curve.map((p, i) => {
    const x = pad + (p.r / 10) * plotW;
    const y = pad + plotH - (p.v / (maxV * 1.2)) * plotH;
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  const lineColor = mode === 'emergent' ? 'hsl(187, 80%, 55%)' : 'hsl(45, 90%, 55%)';

  return (
    <div className={`cosmic-card ${className}`}>
      <h3 className="font-display text-lg text-foreground mb-4">Interactive Rotation Curve</h3>

      <div className="flex gap-3 mb-4">
        <button
          onClick={() => setMode('newtonian')}
          className={`px-3 py-1.5 rounded text-xs font-display transition-all ${
            mode === 'newtonian'
              ? 'bg-secondary text-secondary-foreground'
              : 'bg-muted/30 text-muted-foreground hover:bg-muted/50'
          }`}
        >
          Newtonian
        </button>
        <button
          onClick={() => setMode('emergent')}
          className={`px-3 py-1.5 rounded text-xs font-display transition-all ${
            mode === 'emergent'
              ? 'bg-primary/20 text-primary border border-primary/30'
              : 'bg-muted/30 text-muted-foreground hover:bg-muted/50'
          }`}
        >
          Emergent
        </button>
      </div>

      <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`} className="max-w-full h-auto">
        <line x1={pad} y1={pad + plotH} x2={pad + plotW} y2={pad + plotH} stroke="rgba(100,200,255,0.15)" />
        <line x1={pad} y1={pad} x2={pad} y2={pad + plotH} stroke="rgba(100,200,255,0.15)" />
        <text x={svgW / 2} y={svgH - 5} textAnchor="middle" fill="rgba(150,180,220,0.5)" fontSize="10" fontFamily="Space Grotesk">Radius (kpc)</text>
        <text x={10} y={svgH / 2} textAnchor="middle" fill="rgba(150,180,220,0.5)" fontSize="10" fontFamily="Space Grotesk" transform={`rotate(-90, 10, ${svgH / 2})`}>v (km/s)</text>

        <motion.path
          d={pathD}
          fill="none"
          stroke={lineColor}
          strokeWidth="2.5"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1 }}
          key={`${mode}-${mass}-${redshift}`}
        />
        <motion.path
          d={pathD}
          fill="none"
          stroke={lineColor}
          strokeWidth="10"
          strokeLinecap="round"
          opacity={0.1}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1 }}
          key={`glow-${mode}-${mass}-${redshift}`}
        />
      </svg>

      <div className="space-y-3 mt-4">
        <div>
          <label className="text-xs text-muted-foreground font-display">
            Mass: {mass.toFixed(1)} × 10¹⁰ M☉
          </label>
          <input
            type="range"
            min="1"
            max="50"
            step="0.5"
            value={mass}
            onChange={e => setMass(Number(e.target.value))}
            className="w-full h-1 bg-muted/30 rounded-full appearance-none cursor-pointer accent-primary"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground font-display">
            Redshift z = {redshift.toFixed(1)}
          </label>
          <input
            type="range"
            min="0"
            max="3"
            step="0.1"
            value={redshift}
            onChange={e => setRedshift(Number(e.target.value))}
            className="w-full h-1 bg-muted/30 rounded-full appearance-none cursor-pointer accent-primary"
          />
        </div>
      </div>

      {mode === 'emergent' && (
        <motion.p
          className="text-xs text-primary/70 mt-3 font-body"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Notice the flat rotation curve — stars at large radii maintain velocity, matching observations.
        </motion.p>
      )}
    </div>
  );
}
