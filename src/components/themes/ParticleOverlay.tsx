import React, { useEffect, useRef } from 'react';
import { AppThemeId } from '../../types';

interface Props {
  theme: AppThemeId;
  className?: string;
}

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  size: number;
  rotation: number; rotationSpeed: number;
  opacity: number; pulse: number;
  hue: string;
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/**
 * Fondo vivo por tema:
 * - sakura: pétalos de cerezo con estela suave
 * - cyberpunk: bits de datos neón + scanline + malla de conexiones
 * - golden: polvo dorado con destello pulsante y lente bokeh
 * Rendimiento: DPR correcto, densidad adaptable al tamaño, pausa al ocultar pestaña.
 */
export const ParticleOverlay: React.FC<Props> = ({ theme, className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const themeRef = useRef(theme);
  themeRef.current = theme;

  useEffect(() => {
    if (theme === 'minimal') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    if (prefersReducedMotion()) return; // el CSS aurora estático queda como fondo

    let raf = 0;
    let running = true;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(parent.clientWidth * dpr));
      canvas.height = Math.max(1, Math.floor(parent.clientHeight * dpr));
      canvas.style.width = `${parent.clientWidth}px`;
      canvas.style.height = `${parent.clientHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const w = () => canvas.width / dpr;
    const h = () => canvas.height / dpr;

    const rnd = (a: number, b: number) => a + Math.random() * (b - a);
    const density = Math.min(34, Math.max(14, Math.round((w() * h()) / 26000)));

    const particles: Particle[] = Array.from({ length: density }, () => ({
      x: rnd(0, w()), y: rnd(0, h()),
      vx: rnd(-0.3, 0.3), vy: 0,
      size: 0, rotation: rnd(0, Math.PI * 2), rotationSpeed: rnd(-0.02, 0.02),
      opacity: rnd(0.35, 0.9), pulse: rnd(0, Math.PI * 2),
      hue: '',
    }));

    // Personalización por tema
    const t = themeRef.current;
    if (t === 'sakura') {
      particles.forEach((p) => {
        p.size = rnd(6, 14);
        p.vy = rnd(0.6, 1.4);
        p.vx = rnd(-0.25, 0.35);
      });
    } else if (t === 'cyberpunk') {
      particles.forEach((p) => {
        p.size = rnd(1.5, 3);
        p.vy = -rnd(0.5, 1.6);
        p.hue = Math.random() > 0.5 ? '0,240,255' : '255,0,127';
      });
    } else if (t === 'golden') {
      particles.forEach((p) => {
        p.size = rnd(1, 3);
        p.vy = -rnd(0.2, 0.6);
      });
    } else if (t === 'aurora') {
      // Burbujas de aurora boreal con transparencia variable y desplazamiento lateral
      particles.forEach((p) => {
        p.size = rnd(9, 26);
        p.vy = rnd(-0.35, 0.15);
        p.vx = rnd(-0.18, 0.18);
        p.hue = Math.random() > 0.5 ? '142,120,255' : '65,85,250';
      });
    } else if (t === 'nocturn') {
      // Hielo quebrado + relámpagos lejanos: fragmentos con brillo puntual y parpadeo
      particles.forEach((p) => {
        p.size = rnd(2, 5);
        p.vy = rnd(-0.4, 0.2);
        p.vx = rnd(-0.12, 0.12);
        p.hue = Math.random() > 0.5 ? '255,250,235' : '120,245,255';
      });
    }

    let scanlineY = 0;

    const drawPetal = (p: Particle) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.beginPath();
      const s = p.size;
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(s / 2, -s / 2, s, -s / 4, s, s / 2);
      ctx.bezierCurveTo(s, s, s / 2, s, 0, 0);
      ctx.fillStyle = `rgba(251,182,206,${p.opacity})`;
      ctx.shadowColor = 'rgba(244,114,182,0.35)';
      ctx.shadowBlur = 6;
      ctx.fill();

      // Nervadura del pétalo
      ctx.shadowBlur = 0;
      ctx.strokeStyle = `rgba(249,168,212,${p.opacity * 0.6})`;
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(s * 0.15, s * 0.1);
      ctx.quadraticCurveTo(s * 0.6, 0, s * 0.85, s * 0.4);
      ctx.stroke();
      ctx.restore();
    };

    const renderSakura = () => {
      // Estela sutil
      ctx.fillStyle = 'rgba(255,241,246,0.05)';
      ctx.fillRect(0, 0, w(), h());
      for (const p of particles) {
        p.y += p.vy;
        p.x += Math.sin(p.y * 0.012) * 0.7 + p.vx;
        p.rotation += p.rotationSpeed;
        if (p.y > h() + 24) { p.y = -24; p.x = rnd(0, w()); }
        if (p.x > w() + 24) p.x = -24;
        if (p.x < -24) p.x = w() + 24;
        drawPetal(p);
      }
    };

    const renderCyberpunk = () => {
      ctx.fillStyle = 'rgba(2,6,23,0.08)';
      ctx.fillRect(0, 0, w(), h());

      // Malla de conexiones
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist2 = dx * dx + dy * dy;
          if (dist2 < 9216) {
            const alpha = (1 - Math.sqrt(dist2) / 96) * 0.16;
            ctx.strokeStyle = `rgba(0,240,255,${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Scanline
      scanlineY += 1.4;
      if (scanlineY > h()) scanlineY = 0;
      const grad = ctx.createLinearGradient(0, scanlineY - 18, 0, scanlineY + 18);
      grad.addColorStop(0, 'rgba(0,240,255,0)');
      grad.addColorStop(0.5, 'rgba(0,240,255,0.07)');
      grad.addColorStop(1, 'rgba(0,240,255,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, scanlineY - 18, w(), 36);

      for (const p of particles) {
        p.y += p.vy;
        p.x += Math.sin(p.y * 0.02) * 0.15;
        if (p.y < -12) { p.y = h() + 12; p.x = rnd(0, w()); }
        ctx.fillStyle = `rgba(${p.hue},${p.opacity})`;
        ctx.shadowColor = `rgba(${p.hue},0.8)`;
        ctx.shadowBlur = 7;
        ctx.fillRect(p.x, p.y, p.size, p.size * 2.2);
      }
      ctx.shadowBlur = 0;
    };

    const renderAurora = () => {
      // Cielo nocturno con capas de aurora boreal cruzadas
      ctx.fillStyle = 'rgba(10,12,34,0.12)';
      ctx.fillRect(0, 0, w(), h());

      for (let pass = 0; pass < 2; pass++) {
        const baseX = pass === 0 ? 0 : w();
        const grad = ctx.createLinearGradient(
          baseX,
          0,
          baseX + (pass === 0 ? w() * 0.6 : -w() * 0.6),
          h()
        );
        grad.addColorStop(0, 'rgba(20,100,245,0.02)');
        grad.addColorStop(0.45, 'rgba(120,90,255,0.12)');
        grad.addColorStop(0.7, 'rgba(40,220,195,0.08)');
        grad.addColorStop(1, 'rgba(10,12,34,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w(), h());
      }

      for (const p of particles) {
        p.y += p.vy;
        p.x += Math.sin(p.y * 0.008) * 0.4 + p.vx;
        p.rotation += 0.004;
        if (p.y > h() + 40) { p.y = -40; p.x = rnd(0, w()); }
        if (p.x > w() + 40) p.x = -40;
        if (p.x < -40) p.x = w() + 40;

        const tw = 0.4 + Math.sin(p.pulse + p.y * 0.02) * 0.6;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.beginPath();
        ctx.arc(0, 0, p.size * (0.6 + tw * 0.5), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.hue},${0.15 + tw * 0.5})`;
        ctx.shadowColor = `rgba(${p.hue},0.6)`;
        ctx.shadowBlur = 18;
        ctx.fill();
        ctx.restore();
      }

      // Rayo lejano efímero
      const moon = particles[0];
      if (moon) {
        const flare = Math.sin(moon.pulse * 0.12) * 0.5 + 0.5;
        ctx.beginPath();
        ctx.moveTo(moon.x - 80, 0);
        ctx.lineTo(moon.x, h() * 0.5 + Math.sin(moon.pulse) * 20);
        ctx.lineTo(moon.x + 80, 0);
        ctx.closePath();
        ctx.fillStyle = `rgba(20,160,255,${0.02 + flare * 0.05})`;
        ctx.fill();
      }
    };

    const renderNocturn = () => {
      // Fondo frío oscuro + destellos de hielo que parpadean
      ctx.fillStyle = 'rgba(6,9,22,0.14)';
      ctx.fillRect(0, 0, w(), h());

      for (let i = 0; i < 6; i++) {
        const y = (i * 38 + 12) % h();
        ctx.fillStyle = `rgba(120,220,255,${0.02 + Math.sin(Date.now() * 0.0006 + i) * 0.01})`;
        ctx.fillRect(0, y, w(), 1);
      }

      for (const p of particles) {
        p.y += p.vy;
        p.x += Math.sin(p.y * 0.01) * 0.2 + p.vx;
        p.pulse += 0.04;
        if (p.y > h() + 20) { p.y = -20; p.x = rnd(0, w()); }

        const flash = Math.sin(p.pulse) > 0.85 ? 0.9 : 0.15;
        ctx.fillStyle = `rgba(${p.hue},${flash})`;
        ctx.shadowColor = `rgba(${p.hue},${flash * 0.5})`;
        ctx.shadowBlur = 10;
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      }
      ctx.shadowBlur = 0;

      if (Math.random() > 0.88) {
        ctx.fillStyle = 'rgba(255,250,255,0.10)';
        ctx.shadowColor = 'rgba(200,240,255,0.5)';
        ctx.shadowBlur = 30;
        ctx.fillRect(rnd(0, w()), rnd(0, h()), rnd(20, 120), rnd(1, 2));
        ctx.shadowBlur = 0;
      }
    };

    const renderGolden = () => {
      ctx.fillStyle = 'rgba(255,253,240,0.05)';
      ctx.fillRect(0, 0, w(), h());
      for (const p of particles) {
        p.y += p.vy;
        p.pulse += 0.035;
        if (p.y < -12) { p.y = h() + 12; p.x = rnd(0, w()); }
        const tw = 0.5 + Math.sin(p.pulse) * 0.5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (0.8 + tw * 0.4), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(234,179,8,${p.opacity * (0.4 + tw * 0.6)})`;
        ctx.shadowColor = 'rgba(250,204,21,0.55)';
        ctx.shadowBlur = 5 + tw * 6;
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      // Destello bokeh grande ocasional
      const moon = particles[0];
      if (moon) {
        ctx.beginPath();
        ctx.arc(moon.x, moon.y, 26 + Math.sin(moon.pulse * 0.4) * 4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(250,204,21,0.045)';
        ctx.shadowColor = 'rgba(250,204,21,0.3)';
        ctx.shadowBlur = 30;
        ctx.fill();
        ctx.shadowBlur = 0;
        moon.y -= 0.03;
        if (moon.y < -40) moon.y = h() + 40;
      }
    };

    const render = () => {
      if (!running) return;
      ctx.clearRect(0, 0, w(), h());
      const t = themeRef.current;
      if (t === 'sakura') renderSakura();
      else if (t === 'cyberpunk') renderCyberpunk();
      else if (t === 'golden') renderGolden();
      else if (t === 'aurora') renderAurora();
      else if (t === 'nocturn') renderNocturn();
      raf = requestAnimationFrame(render);
    };

    const onVisibility = () => {
      const shouldRun = document.visibilityState === 'visible' && !prefersReducedMotion();
      if (shouldRun && !running) {
        running = true;
        if (!raf) raf = requestAnimationFrame(render);
      } else if (!shouldRun && running) {
        running = false;
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onMqChange = () => {
      if (mq.matches) {
        running = false;
        cancelAnimationFrame(raf);
        raf = 0;
      } else {
        running = true;
        raf = requestAnimationFrame(render);
      }
    };
    mq.addEventListener('change', onMqChange);
    document.addEventListener('visibilitychange', onVisibility);

    raf = requestAnimationFrame(render);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      mq.removeEventListener('change', onMqChange);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [theme]);      if (theme === 'minimal') return null;

  // IDs vibrantes por tema para descargar la página
  const staticHint = (() => {
    const t = themeRef.current;
    if (t === 'sakura') return 'sakura-vivid';
    if (t === 'cyberpunk') return 'cyberpunk-neon';
    if (t === 'golden') return 'golden-luxury';
    if (t === 'aurora') return 'aurora-vivid';
    if (t === 'nocturn') return 'nocturn-edge';
    return '';
  })();

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none inset-0 w-full h-full ${className}`}
    />
  );
};
