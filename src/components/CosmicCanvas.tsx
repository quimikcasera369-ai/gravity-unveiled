import { useEffect, useRef, useCallback } from 'react';

interface Star {
  x: number;
  y: number;
  z: number;
  ox: number;
  oy: number;
  size: number;
  brightness: number;
  speed: number;
}

interface GalaxyParticle {
  angle: number;
  radius: number;
  speed: number;
  size: number;
  arm: number;
  brightness: number;
  color: string;
}

const STAR_COUNT = 400;
const GALAXY_PARTICLE_COUNT = 600;

function createStars(w: number, h: number): Star[] {
  return Array.from({ length: STAR_COUNT }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    z: Math.random(),
    ox: Math.random() * w,
    oy: Math.random() * h,
    size: Math.random() * 2 + 0.5,
    brightness: Math.random(),
    speed: Math.random() * 0.5 + 0.1,
  }));
}

function createGalaxy(): GalaxyParticle[] {
  const colors = [
    'rgba(100,200,255,', 'rgba(255,220,100,', 'rgba(200,160,255,',
    'rgba(255,180,200,', 'rgba(180,220,255,',
  ];
  return Array.from({ length: GALAXY_PARTICLE_COUNT }, () => {
    const arm = Math.floor(Math.random() * 4);
    return {
      angle: (arm * Math.PI / 2) + (Math.random() - 0.5) * 0.8,
      radius: Math.random() * 0.4 + 0.02,
      speed: (Math.random() * 0.3 + 0.1) * (Math.random() > 0.5 ? 1 : 0.6),
      size: Math.random() * 2.5 + 0.5,
      arm,
      brightness: Math.random() * 0.7 + 0.3,
      color: colors[Math.floor(Math.random() * colors.length)],
    };
  });
}

interface CosmicCanvasProps {
  progress: number;
  mouseX: number;
  mouseY: number;
}

export default function CosmicCanvas({ progress, mouseX, mouseY }: CosmicCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const galaxyRef = useRef<GalaxyParticle[]>([]);
  const frameRef = useRef<number>(0);
  const timeRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      starsRef.current = createStars(canvas.width, canvas.height);
    };
    resize();
    galaxyRef.current = createGalaxy();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    timeRef.current += 0.016;
    const t = timeRef.current;

    // Clear
    ctx.fillStyle = '#050508';
    ctx.fillRect(0, 0, w, h);

    // Section progress mapping (0-1 maps to 7 sections)
    const section = progress * 7;

    // === BACKGROUND GRADIENT ===
    const gradientIntensity = Math.min(section / 2, 1);
    const gradient = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.7);
    
    if (section < 2) {
      gradient.addColorStop(0, `rgba(15, 10, 30, ${gradientIntensity * 0.5})`);
      gradient.addColorStop(1, 'rgba(5, 5, 8, 1)');
    } else if (section < 4) {
      const t2 = (section - 2) / 2;
      gradient.addColorStop(0, `rgba(${10 + t2 * 20}, ${15 + t2 * 10}, ${40 + t2 * 20}, 0.6)`);
      gradient.addColorStop(1, 'rgba(5, 5, 8, 1)');
    } else if (section < 6) {
      gradient.addColorStop(0, `rgba(20, 12, 40, 0.5)`);
      gradient.addColorStop(1, 'rgba(5, 5, 8, 1)');
    } else {
      const t3 = (section - 6);
      gradient.addColorStop(0, `rgba(${15 + t3 * 15}, ${20 + t3 * 15}, ${50 + t3 * 10}, 0.5)`);
      gradient.addColorStop(1, 'rgba(5, 5, 8, 1)');
    }
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    // === STARS ===
    const starOpacity = section < 1 ? Math.min(section * 2, 1) : Math.max(0.2, 1 - (section - 3) * 0.15);
    const parallaxX = (mouseX - 0.5) * 20;
    const parallaxY = (mouseY - 0.5) * 20;

    starsRef.current.forEach(star => {
      const twinkle = Math.sin(t * star.speed * 3 + star.brightness * 10) * 0.3 + 0.7;
      const alpha = star.brightness * twinkle * starOpacity;
      const sx = star.ox + parallaxX * star.z;
      const sy = star.oy + parallaxY * star.z;
      ctx.beginPath();
      ctx.arc(sx, sy, star.size * star.z, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200, 220, 255, ${alpha})`;
      ctx.fill();

      // Glow for bright stars
      if (star.brightness > 0.8) {
        ctx.beginPath();
        ctx.arc(sx, sy, star.size * star.z * 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(150, 200, 255, ${alpha * 0.15})`;
        ctx.fill();
      }
    });

    // === GALAXY (Sections 1-4) ===
    if (section > 0.5 && section < 5) {
      const galaxyOpacity = section < 1.5 ? (section - 0.5) : section > 4 ? (5 - section) : 1;
      const cx = w / 2 + parallaxX * 0.5;
      const cy = h / 2 + parallaxY * 0.5;
      const galaxyScale = Math.min(w, h) * 0.35;

      // Determine if we show "broken" Newtonian or "fixed" emergent
      const isNewtonian = section < 2.5;
      const transitionProgress = section >= 2 && section < 3 ? (section - 2) : section >= 3 ? 1 : 0;

      // Glitch/distortion effect during transition (section 2-3)
      const glitchIntensity = section >= 2 && section < 3 ? Math.sin(t * 15) * (1 - Math.abs(section - 2.5) * 2) * 0.3 : 0;

      galaxyRef.current.forEach(p => {
        const baseAngle = p.angle + t * p.speed * 0.3;
        
        // In Newtonian: outer particles move slower (Keplerian decline)
        // In Emergent: flat rotation curve (all move at similar speed)
        let effectiveSpeed: number;
        if (isNewtonian) {
          effectiveSpeed = p.speed / (1 + p.radius * 3);
        } else {
          const lerpFactor = transitionProgress;
          const newtonianSpeed = p.speed / (1 + p.radius * 3);
          const flatSpeed = p.speed * 0.7;
          effectiveSpeed = newtonianSpeed + (flatSpeed - newtonianSpeed) * lerpFactor;
        }

        const angle = baseAngle + t * effectiveSpeed;
        const spiralAngle = angle + p.radius * 4;

        let px = cx + Math.cos(spiralAngle) * p.radius * galaxyScale;
        let py = cy + Math.sin(spiralAngle) * p.radius * galaxyScale * 0.4; // Flatten for perspective

        // Add glitch displacement
        if (glitchIntensity > 0) {
          px += (Math.random() - 0.5) * glitchIntensity * 50;
          py += (Math.random() - 0.5) * glitchIntensity * 50;
        }

        const alpha = p.brightness * galaxyOpacity * (1 - glitchIntensity * 0.5);
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color + `${alpha})`;
        ctx.fill();
      });

      // Galaxy core glow
      const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, galaxyScale * 0.15);
      coreGrad.addColorStop(0, `rgba(255, 240, 200, ${0.3 * galaxyOpacity})`);
      coreGrad.addColorStop(0.5, `rgba(200, 160, 255, ${0.1 * galaxyOpacity})`);
      coreGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = coreGrad;
      ctx.fillRect(cx - galaxyScale * 0.2, cy - galaxyScale * 0.2, galaxyScale * 0.4, galaxyScale * 0.4);
    }

    // === CRITICAL SCALE SPHERE (Sections 3-4) ===
    if (section > 3 && section < 5) {
      const sphereOpacity = section < 3.5 ? (section - 3) * 2 : section > 4.5 ? (5 - section) * 2 : 1;
      const cx = w / 2;
      const cy = h / 2;
      const baseRadius = Math.min(w, h) * 0.15;
      const pulseRadius = baseRadius + Math.sin(t * 2) * 5;

      // Threshold sphere
      ctx.beginPath();
      ctx.arc(cx, cy, pulseRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(100, 220, 255, ${0.6 * sphereOpacity})`;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Inner glow
      const sGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, pulseRadius);
      sGrad.addColorStop(0, `rgba(100, 220, 255, ${0.08 * sphereOpacity})`);
      sGrad.addColorStop(0.7, `rgba(100, 220, 255, ${0.03 * sphereOpacity})`);
      sGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = sGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, pulseRadius, 0, Math.PI * 2);
      ctx.fill();

      // Outer glow rings
      for (let i = 1; i <= 3; i++) {
        ctx.beginPath();
        ctx.arc(cx, cy, pulseRadius + i * 20, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(100, 220, 255, ${0.15 * sphereOpacity / i})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Orbiting particles around sphere
      for (let i = 0; i < 12; i++) {
        const orbitAngle = (i / 12) * Math.PI * 2 + t * 0.8;
        const orbitRadius = pulseRadius * 1.3;
        const px = cx + Math.cos(orbitAngle) * orbitRadius;
        const py = cy + Math.sin(orbitAngle) * orbitRadius * 0.6;
        ctx.beginPath();
        ctx.arc(px, py, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 220, 100, ${0.7 * sphereOpacity})`;
        ctx.fill();
      }
    }

    // === GEOMETRY / S³ LOOPS (Sections 4-5) ===
    if (section > 4 && section < 6.5) {
      const loopOpacity = section < 4.5 ? (section - 4) * 2 : section > 6 ? (6.5 - section) * 2 : 1;
      const cx = w / 2;
      const cy = h / 2;
      const loopRadius = Math.min(w, h) * 0.25;

      // Draw curved loops representing closed geodesics
      for (let i = 0; i < 5; i++) {
        const phase = (i / 5) * Math.PI * 2;
        ctx.beginPath();
        for (let a = 0; a <= Math.PI * 2; a += 0.05) {
          const r = loopRadius * (0.6 + 0.4 * Math.sin(a * 2 + phase));
          const x = cx + Math.cos(a + t * 0.2 + phase) * r;
          const y = cy + Math.sin(a + t * 0.2 + phase) * r * 0.5;
          if (a === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        const hue = 187 + i * 30;
        ctx.strokeStyle = `hsla(${hue}, 70%, 60%, ${0.4 * loopOpacity})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Flowing particles along loops
      for (let i = 0; i < 20; i++) {
        const loopIdx = i % 5;
        const phase = (loopIdx / 5) * Math.PI * 2;
        const a = ((i / 20) * Math.PI * 2 + t * 0.5) % (Math.PI * 2);
        const r = loopRadius * (0.6 + 0.4 * Math.sin(a * 2 + phase));
        const x = cx + Math.cos(a + t * 0.2 + phase) * r;
        const y = cy + Math.sin(a + t * 0.2 + phase) * r * 0.5;
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(100, 220, 255, ${0.8 * loopOpacity})`;
        ctx.fill();
      }
    }

    // === COSMIC EXPANSION (Sections 5-6) ===
    if (section > 5) {
      const cosmicOpacity = Math.min((section - 5), 1);
      const cx = w / 2;
      const cy = h / 2;

      // Expanding grid
      const gridSpacing = 60 + (section - 5) * 30;
      const gridAlpha = 0.08 * cosmicOpacity;
      ctx.strokeStyle = `rgba(100, 200, 255, ${gridAlpha})`;
      ctx.lineWidth = 0.5;

      for (let x = cx % gridSpacing; x < w; x += gridSpacing) {
        // Curve the grid lines slightly to suggest curvature
        ctx.beginPath();
        ctx.moveTo(x, 0);
        const bend = Math.sin(((x - cx) / w) * Math.PI) * 30 * cosmicOpacity;
        ctx.quadraticCurveTo(x + bend, h / 2, x, h);
        ctx.stroke();
      }
      for (let y = cy % gridSpacing; y < h; y += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        const bend = Math.sin(((y - cy) / h) * Math.PI) * 30 * cosmicOpacity;
        ctx.quadraticCurveTo(w / 2, y + bend, w, y);
        ctx.stroke();
      }

      // Horizon glow
      const horizonGrad = ctx.createRadialGradient(cx, cy, w * 0.3, cx, cy, w * 0.6);
      horizonGrad.addColorStop(0, 'rgba(0,0,0,0)');
      horizonGrad.addColorStop(0.8, `rgba(80, 40, 120, ${0.05 * cosmicOpacity})`);
      horizonGrad.addColorStop(1, `rgba(40, 20, 80, ${0.15 * cosmicOpacity})`);
      ctx.fillStyle = horizonGrad;
      ctx.fillRect(0, 0, w, h);
    }

    frameRef.current = requestAnimationFrame(draw);
  }, [progress, mouseX, mouseY]);

  useEffect(() => {
    frameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frameRef.current);
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full"
      style={{ zIndex: 0 }}
    />
  );
}
