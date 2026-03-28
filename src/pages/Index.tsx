import { useState, useCallback } from 'react';
import { useScrollProgress } from '@/hooks/useScrollProgress';
import CosmicCanvas from '@/components/CosmicCanvas';
import ScrollSection from '@/components/ScrollSection';
import ScrollIndicator from '@/components/ScrollIndicator';
import AnimatedGraph from '@/components/AnimatedGraph';
import AnimatedBarChart from '@/components/AnimatedBarChart';
import InteractivePanel from '@/components/InteractivePanel';
import { motion } from 'framer-motion';

// Data for graphs
const gCritVsZ = Array.from({ length: 15 }, (_, i) => {
  const z = i * 0.2;
  return { x: z, y: 1.2 + z * 0.12 };
});

const btfrData = [
  { x: 8.5, y: 1.8 }, { x: 9.0, y: 2.0 }, { x: 9.5, y: 2.15 },
  { x: 10.0, y: 2.3 }, { x: 10.5, y: 2.42 }, { x: 11.0, y: 2.55 },
  { x: 11.5, y: 2.65 },
];

const errorHistogram = [
  { label: '-0.3', value: 2, color: 'hsl(270, 60%, 50%)' },
  { label: '-0.2', value: 5, color: 'hsl(270, 60%, 55%)' },
  { label: '-0.1', value: 12, color: 'hsl(220, 70%, 55%)' },
  { label: '0.0', value: 28, color: 'hsl(187, 80%, 55%)' },
  { label: '+0.1', value: 35, color: 'hsl(187, 80%, 55%)' },
  { label: '+0.12', value: 40, color: 'hsl(160, 80%, 50%)' },
  { label: '+0.2', value: 18, color: 'hsl(45, 80%, 55%)' },
  { label: '+0.3', value: 8, color: 'hsl(45, 70%, 50%)' },
  { label: '+0.4', value: 3, color: 'hsl(30, 70%, 50%)' },
];

const sectionNav = [
  'Void', 'Galaxy', 'Discovery', 'Critical Scale', 'Geometry', 'Cosmos', 'Prediction'
];

export default function Index() {
  const progress = useScrollProgress();
  const [mouseX, setMouseX] = useState(0.5);
  const [mouseY, setMouseY] = useState(0.5);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setMouseX(e.clientX / window.innerWidth);
    setMouseY(e.clientY / window.innerHeight);
  }, []);

  const activeSection = Math.min(6, Math.floor(progress * 7));

  return (
    <div onMouseMove={handleMouseMove} className="relative">
      {/* Fixed canvas background */}
      <CosmicCanvas progress={progress} mouseX={mouseX} mouseY={mouseY} />

      {/* Progress bar */}
      <div className="fixed top-0 left-0 w-full h-[2px] z-50">
        <motion.div
          className="h-full bg-primary"
          style={{ width: `${progress * 100}%`, boxShadow: '0 0 10px hsl(187 80% 55% / 0.5)' }}
        />
      </div>

      {/* Section nav dots */}
      <nav className="fixed right-4 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col gap-3">
        {sectionNav.map((name, i) => (
          <button
            key={name}
            onClick={() => {
              const target = document.getElementById(`section-${i}`);
              target?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="group flex items-center gap-2"
          >
            <span className={`text-[10px] font-display tracking-wider uppercase opacity-0 group-hover:opacity-100 transition-opacity text-right ${
              activeSection === i ? 'text-primary' : 'text-muted-foreground'
            }`}>
              {name}
            </span>
            <div className={`w-2 h-2 rounded-full transition-all ${
              activeSection === i
                ? 'bg-primary scale-125 shadow-[0_0_8px_hsl(187_80%_55%/0.5)]'
                : 'bg-muted-foreground/30 hover:bg-muted-foreground/60'
            }`} />
          </button>
        ))}
      </nav>

      {/* ==================== SECTION 1: VOID INTRO ==================== */}
      <ScrollSection id="section-0" className="min-h-[120vh]">
        <div className="text-center relative pb-24">
          <motion.p
            className="text-sm tracking-[0.3em] uppercase text-muted-foreground mb-6 font-display"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1.5 }}
          >
            A journey beyond spacetime
          </motion.p>
          <motion.h1
            className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-bold leading-tight cosmic-text-glow"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 1.5 }}
          >
            What if spacetime
            <br />
            <span className="text-primary">is not fundamental?</span>
          </motion.h1>
          <motion.p
            className="mt-8 text-lg text-muted-foreground max-w-xl mx-auto font-body leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 1.5 }}
          >
            Emergent gravity proposes that gravity is not a fundamental force — it arises
            from deeper microscopic physics, like temperature emerges from molecular motion.
          </motion.p>
          <ScrollIndicator />
        </div>
      </ScrollSection>

      {/* ==================== SECTION 2: GALAXY PROBLEM ==================== */}
      <ScrollSection id="section-1">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-xs tracking-[0.2em] uppercase text-secondary mb-3 font-display">The Problem</p>
            <h2 className="text-3xl sm:text-5xl font-display font-bold mb-6 cosmic-text-gold">
              Galaxies shouldn't work
            </h2>
            <div className="glow-line-gold mb-6" />
            <p className="text-muted-foreground font-body leading-relaxed mb-4">
              In Newtonian gravity, stars at the edges of galaxies should orbit slower — like
              distant planets around the Sun. But observations show they orbit at nearly the
              same speed as inner stars.
            </p>
            <p className="text-muted-foreground font-body leading-relaxed">
              This <span className="text-secondary font-medium">flat rotation curve</span> has
              been one of the strongest pieces of evidence for dark matter. But what if the
              answer lies in gravity itself?
            </p>
          </div>
          <div className="flex justify-center">
            <AnimatedGraph
              data={[
                { x: 1, y: 3.2 }, { x: 2, y: 2.3 }, { x: 3, y: 1.8 },
                { x: 4, y: 1.6 }, { x: 5, y: 1.4 }, { x: 6, y: 1.3 },
                { x: 7, y: 1.2 }, { x: 8, y: 1.1 }, { x: 9, y: 1.05 },
              ]}
              color="rgba(255, 200, 80, 0.9)"
              label="Newtonian Prediction (Keplerian Decline)"
              xLabel="Radius (kpc)"
              yLabel="Velocity"
              width={400}
              height={250}
            />
          </div>
        </div>
      </ScrollSection>

      {/* ==================== SECTION 3: DISCOVERY ==================== */}
      <ScrollSection id="section-2">
        <div className="text-center max-w-3xl mx-auto">
          <p className="text-xs tracking-[0.2em] uppercase text-accent mb-3 font-display">The Breakthrough</p>
          <h2 className="text-3xl sm:text-5xl font-display font-bold mb-6 cosmic-text-purple">
            Gravity, reimagined
          </h2>
          <div className="glow-line mb-8 max-w-md mx-auto" />
          <p className="text-muted-foreground font-body leading-relaxed mb-8">
            Erik Verlinde's emergent gravity framework introduces a critical acceleration scale.
            Below this threshold, gravity transitions from the familiar Newtonian regime into
            something deeper — an entropic force arising from the quantum structure of spacetime itself.
          </p>

          <div className="grid sm:grid-cols-2 gap-6 text-left">
            <div className="cosmic-card">
              <div className="text-secondary text-2xl font-display font-bold mb-2">g &gt; g<sub>crit</sub></div>
              <p className="text-sm text-muted-foreground">
                Standard Newtonian gravity dominates. Solar system, Earth, everyday physics — unchanged.
              </p>
            </div>
            <div className="cosmic-card border-primary/20">
              <div className="text-primary text-2xl font-display font-bold mb-2">g &lt; g<sub>crit</sub></div>
              <p className="text-sm text-muted-foreground">
                Emergent regime activates. Additional gravitational effects arise from spacetime's elastic response — no dark matter needed.
              </p>
            </div>
          </div>
        </div>
      </ScrollSection>

      {/* ==================== SECTION 4: CRITICAL SCALE ==================== */}
      <ScrollSection id="section-3">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-xs tracking-[0.2em] uppercase text-primary mb-3 font-display">The Threshold</p>
            <h2 className="text-3xl sm:text-5xl font-display font-bold mb-6 cosmic-text-glow">
              The critical scale
            </h2>
            <div className="glow-line mb-6" />
            <p className="text-muted-foreground font-body leading-relaxed mb-4">
              g<sub>crit</sub> ≈ 1.2 × 10<sup>−10</sup> m/s² — a fundamental acceleration scale
              that marks the boundary between two gravitational regimes.
            </p>
            <p className="text-muted-foreground font-body leading-relaxed mb-4">
              This isn't arbitrary. It connects to the cosmological constant Λ and the
              de Sitter horizon, suggesting gravity and cosmology are deeply intertwined.
            </p>
            <div className="cosmic-card border-primary/20 mt-6">
              <p className="text-primary font-display text-sm font-medium">Key relation</p>
              <p className="text-foreground font-display text-xl mt-1">
                g<sub>crit</sub> ~ √(Λ) · c²
              </p>
            </div>
          </div>
          <div>
            <AnimatedGraph
              data={gCritVsZ}
              color="rgba(100, 220, 255, 0.9)"
              label="g_crit evolution with redshift"
              xLabel="Redshift z"
              yLabel="g_crit (×10⁻¹⁰ m/s²)"
              width={420}
              height={280}
            />
          </div>
        </div>
      </ScrollSection>

      {/* ==================== SECTION 5: GEOMETRY ==================== */}
      <ScrollSection id="section-4">
        <div className="text-center max-w-3xl mx-auto">
          <p className="text-xs tracking-[0.2em] uppercase text-glow-pink mb-3 font-display">Geometric Origin</p>
          <h2 className="text-3xl sm:text-5xl font-display font-bold mb-6">
            Closed geometry,
            <br />
            <span className="text-primary">stable orbits</span>
          </h2>
          <div className="glow-line mb-8 max-w-md mx-auto" />
          <p className="text-muted-foreground font-body leading-relaxed mb-8">
            In Verlinde's framework, the universe's spatial geometry resembles a 3-sphere (S³).
            Paths that would escape in flat space curve back on themselves — creating
            naturally stable orbital structures without requiring additional mass.
          </p>
          <p className="text-muted-foreground font-body leading-relaxed">
            The visual above shows these closed geodesic loops. Particles don't fly off
            to infinity — they trace stable, recurring paths through curved space.
          </p>
        </div>
      </ScrollSection>

      {/* ==================== SECTION 6: COSMOLOGY ==================== */}
      <ScrollSection id="section-5">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-xs tracking-[0.2em] uppercase text-accent mb-3 font-display">Cosmic Connection</p>
            <h2 className="text-3xl sm:text-5xl font-display font-bold mb-6 cosmic-text-purple">
              From galaxies to the cosmos
            </h2>
            <div className="glow-line mb-6" />
            <p className="text-muted-foreground font-body leading-relaxed mb-4">
              The same framework that explains galaxy rotation curves connects to
              the accelerating expansion of the universe. The de Sitter horizon
              isn't just a cosmological boundary — it's the source of the entropic
              displacement that generates the emergent gravitational effects.
            </p>
            <p className="text-muted-foreground font-body leading-relaxed">
              As the universe expands and Λ evolves, so does g<sub>crit</sub> — creating
              testable predictions across cosmic time.
            </p>
          </div>
          <div>
            <InteractivePanel />
          </div>
        </div>
      </ScrollSection>

      {/* ==================== SECTION 7: PREDICTION ==================== */}
      <ScrollSection id="section-6" className="min-h-[130vh]">
        <div className="text-center max-w-4xl mx-auto">
          <p className="text-xs tracking-[0.2em] uppercase text-secondary mb-3 font-display">The Prediction</p>
          <h2 className="text-3xl sm:text-5xl font-display font-bold mb-6 cosmic-text-gold">
            A testable future
          </h2>
          <div className="glow-line-gold mb-8 max-w-md mx-auto" />
          <p className="text-muted-foreground font-body leading-relaxed mb-10 max-w-2xl mx-auto">
            The emergent gravity framework makes a bold, falsifiable prediction: the
            Baryonic Tully-Fisher Relation (BTFR) should shift by <span className="text-secondary font-medium">+0.120 dex</span> at
            redshift z ≈ 2 compared to local measurements. This is within reach of
            next-generation telescopes.
          </p>

          <div className="grid sm:grid-cols-2 gap-8 mb-10">
            <AnimatedGraph
              data={btfrData}
              color="rgba(255, 200, 80, 0.9)"
              label="Baryonic Tully-Fisher Relation"
              xLabel="log(M_baryonic / M☉)"
              yLabel="log(V_flat / km s⁻¹)"
              width={380}
              height={260}
            />
            <AnimatedBarChart
              bars={errorHistogram}
              label="BTFR Offset Distribution (dex)"
              height={220}
            />
          </div>

          <div className="cosmic-card max-w-lg mx-auto border-secondary/20">
            <p className="text-secondary font-display font-bold text-lg mb-2">Key Prediction</p>
            <p className="text-foreground font-display text-3xl mb-2">
              Δ(BTFR) = +0.120 dex
            </p>
            <p className="text-muted-foreground text-sm">
              at z ≈ 2, detectable with JWST and ELT-class telescopes
            </p>
          </div>

          <motion.div
            className="mt-16 pt-12 border-t border-border/20"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-muted-foreground font-body text-sm max-w-xl mx-auto leading-relaxed">
              Emergent gravity doesn't just explain what we see — it predicts what we
              haven't seen yet. The coming decade of observations will put this framework
              to the ultimate test.
            </p>
            <p className="mt-6 text-sm text-muted-foreground/70 font-display">
              By <span className="text-primary/80">Juan Pablo Figueroa Torres</span>
            </p>
            <p className="mt-4 text-xs text-muted-foreground/50 font-display tracking-wider uppercase">
              End of journey · Scroll back to explore
            </p>
          </motion.div>
        </div>
      </ScrollSection>
    </div>
  );
}
