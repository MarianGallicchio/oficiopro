import React, { useEffect, useRef } from 'react';
import { AppThemeId } from '../../types';

interface Props {
  theme: AppThemeId;
}

export const ParticleOverlay: React.FC<Props> = ({ theme }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (theme === 'minimal') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 380);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 750);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener('resize', handleResize);

    // Particle Classes based on Theme
    if (theme === 'sakura') {
      // Falling Cherry Blossom Petals 🌸
      const petalsCount = 28;
      const petals: Array<{
        x: number;
        y: number;
        size: number;
        speedY: number;
        speedX: number;
        rotation: number;
        rotationSpeed: number;
        opacity: number;
      }> = [];

      for (let i = 0; i < petalsCount; i++) {
        petals.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 9 + 6,
          speedY: Math.random() * 1.2 + 0.6,
          speedX: Math.random() * 0.8 - 0.2,
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 1.5,
          opacity: Math.random() * 0.4 + 0.5,
        });
      }

      const drawPetal = (x: number, y: number, size: number, rotation: number, opacity: number) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(size / 2, -size / 2, size, -size / 4, size, size / 2);
        ctx.bezierCurveTo(size, size, size / 2, size, 0, 0);
        ctx.fillStyle = `rgba(251, 182, 206, ${opacity})`;
        ctx.shadowColor = 'rgba(244, 114, 182, 0.4)';
        ctx.shadowBlur = 4;
        ctx.fill();
        ctx.restore();
      };

      const render = () => {
        ctx.clearRect(0, 0, width, height);

        for (const petal of petals) {
          petal.y += petal.speedY;
          petal.x += Math.sin(petal.y * 0.01) * 0.8 + petal.speedX;
          petal.rotation += petal.rotationSpeed;

          if (petal.y > height + 20) {
            petal.y = -20;
            petal.x = Math.random() * width;
          }
          if (petal.x > width + 20) petal.x = -20;
          if (petal.x < -20) petal.x = width + 20;

          drawPetal(petal.x, petal.y, petal.size, petal.rotation, petal.opacity);
        }

        animationFrameId = requestAnimationFrame(render);
      };

      render();
    } else if (theme === 'cyberpunk') {
      // Cyberpunk Neon Data Scan & Grid Particles ⚡
      const particlesCount = 20;
      const particles: Array<{
        x: number;
        y: number;
        size: number;
        speedY: number;
        color: string;
      }> = [];

      for (let i = 0; i < particlesCount; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 2.5 + 1,
          speedY: Math.random() * 1.5 + 0.5,
          color: Math.random() > 0.5 ? '#00f0ff' : '#ff007f', // Cyan or Neon Pink
        });
      }

      let scanlineY = 0;

      const render = () => {
        ctx.clearRect(0, 0, width, height);

        // Futuristic Scanline Pulse
        scanlineY += 1.2;
        if (scanlineY > height) scanlineY = 0;

        ctx.fillStyle = 'rgba(0, 240, 255, 0.03)';
        ctx.fillRect(0, scanlineY, width, 3);

        // Data Bits
        for (const p of particles) {
          p.y -= p.speedY;
          if (p.y < 0) {
            p.y = height;
            p.x = Math.random() * width;
          }

          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 6;
          ctx.fillRect(p.x, p.y, p.size, p.size * 2);
        }

        animationFrameId = requestAnimationFrame(render);
      };

      render();
    } else if (theme === 'golden') {
      // Golden Luxury Sparkles ✨
      const sparklesCount = 24;
      const sparkles: Array<{
        x: number;
        y: number;
        radius: number;
        speedY: number;
        opacity: number;
        pulse: number;
      }> = [];

      for (let i = 0; i < sparklesCount; i++) {
        sparkles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 2 + 1,
          speedY: Math.random() * 0.4 + 0.2,
          opacity: Math.random() * 0.6 + 0.2,
          pulse: Math.random() * Math.PI,
        });
      }

      const render = () => {
        ctx.clearRect(0, 0, width, height);

        for (const s of sparkles) {
          s.y -= s.speedY;
          s.pulse += 0.03;
          const currentOpacity = s.opacity + Math.sin(s.pulse) * 0.2;

          if (s.y < -10) {
            s.y = height + 10;
            s.x = Math.random() * width;
          }

          ctx.beginPath();
          ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(234, 179, 8, ${Math.max(0.1, currentOpacity)})`;
          ctx.shadowColor = 'rgba(250, 204, 21, 0.5)';
          ctx.shadowBlur = 5;
          ctx.fill();
        }

        animationFrameId = requestAnimationFrame(render);
      };

      render();
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [theme]);

  if (theme === 'minimal') return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-10 w-full h-full"
    />
  );
};
