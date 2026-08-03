'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { getSiteConfig } from '@/app/actions/supabaseActions';
import { useTranslation } from '@/context/LanguageContext';

interface Point {
  x: number;
  y: number;
}

interface Bolt {
  points: Point[];
  width: number;
  alpha: number;
  isBranch: boolean;
}

interface Cloud {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  speed: number;
}

export function StormHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { t } = useTranslation();
  const [scrollY, setScrollY] = useState(0);

  // Dynamic configuration refs
  const intervalRef = useRef(2000); // 2 seconds default
  const colorRef = useRef('#ffffff'); // White bolt
  const glowRef = useRef('rgba(255, 255, 255, 0.4)'); // White glow

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const data = await getSiteConfig();
        if (data?.description) {
          const parsed = JSON.parse(data.description);
          if (parsed.interval) intervalRef.current = Number(parsed.interval);
          // Override to 2 seconds if not set
          if (!parsed.interval) intervalRef.current = 2000;
        }
      } catch (e) {
        console.error('Error fetching lightning configs:', e);
      }
    };
    fetchConfig();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const clouds: Cloud[] = [];
    const numClouds = 8;
    for (let i = 0; i < numClouds; i++) {
      clouds.push({
        x: Math.random() * width,
        y: Math.random() * (height * 0.5),
        radius: 150 + Math.random() * 200,
        opacity: 0.1 + Math.random() * 0.15,
        speed: 0.05 + Math.random() * 0.05,
      });
    }

    let activeBolts: Bolt[] = [];
    let flashOpacity = 0;
    let nextStrikeTime = Date.now() + 1000 + Math.random() * 2000;
    let strikeDuration = 250;
    let strikeStartTime = 0;
    let isStriking = false;

    function generateJaggedPath(
      startX: number,
      startY: number,
      endX: number,
      endY: number,
      displace: number
    ): Point[] {
      const points: Point[] = [{ x: startX, y: startY }];

      function divide(x1: number, y1: number, x2: number, y2: number, disp: number) {
        if (disp < 4) {
          points.push({ x: x2, y: y2 });
          return;
        }
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;
        const offset = (Math.random() - 0.5) * disp;
        const newX = midX + offset;

        divide(x1, y1, newX, midY, disp / 2);
        divide(newX, midY, x2, y2, disp / 2);
      }

      divide(startX, startY, endX, endY, displace);
      points.sort((a, b) => a.y - b.y);
      return points;
    }

    function createLightningStrike() {
      const startX = width * 0.3 + Math.random() * (width * 0.4);
      const startY = 0;
      const endX = startX + (Math.random() - 0.5) * (width * 0.2);
      const endY = height * 0.4 + Math.random() * (height * 0.4);

      const mainBoltPath = generateJaggedPath(startX, startY, endX, endY, 120);
      const bolts: Bolt[] = [
        {
          points: mainBoltPath,
          width: 2 + Math.random() * 1.5,
          alpha: 1.0,
          isBranch: false,
        },
      ];

      const branchCount = Math.floor(Math.random() * 2);
      for (let i = 0; i < branchCount; i++) {
        if (mainBoltPath.length < 8) continue;
        const branchIdx = Math.floor(Math.random() * (mainBoltPath.length - 4)) + 2;
        const branchStart = mainBoltPath[branchIdx];
        
        const isLeft = Math.random() > 0.5;
        const branchEndX = branchStart.x + (isLeft ? -1 : 1) * (80 + Math.random() * 100);
        const branchEndY = branchStart.y + (100 + Math.random() * 150);

        const branchPath = generateJaggedPath(
          branchStart.x,
          branchStart.y,
          branchEndX,
          Math.min(branchEndY, height),
          50
        );

        bolts.push({
          points: branchPath,
          width: 1 + Math.random() * 1.0,
          alpha: 0.7,
          isBranch: true,
        });
      }

      return bolts;
    }

    const render = () => {
      const now = Date.now();
      ctx.clearRect(0, 0, width, height);

      // Render clouds
      for (const cloud of clouds) {
        cloud.x += cloud.speed;
        if (cloud.x - cloud.radius > width) {
          cloud.x = -cloud.radius;
        }

        const cloudGrad = ctx.createRadialGradient(
          cloud.x,
          cloud.y,
          0,
          cloud.x,
          cloud.y,
          cloud.radius
        );
        cloudGrad.addColorStop(0, `rgba(20, 20, 25, ${cloud.opacity})`);
        cloudGrad.addColorStop(0.5, `rgba(8, 8, 10, ${cloud.opacity * 0.4})`);
        cloudGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = cloudGrad;
        ctx.beginPath();
        ctx.arc(cloud.x, cloud.y, cloud.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Lightning triggers based on intervalRef (default 2 seconds)
      if (!isStriking && now >= nextStrikeTime) {
        activeBolts = createLightningStrike();
        strikeStartTime = now;
        isStriking = true;
      }

      if (isStriking) {
        const elapsed = now - strikeStartTime;

        if (elapsed >= strikeDuration) {
          isStriking = false;
          activeBolts = [];
          flashOpacity = 0;
          nextStrikeTime = now + intervalRef.current;
        } else {
          let visibilityFactor = 0;
          if (elapsed < 40) {
            visibilityFactor = 1.0;
            flashOpacity = 0.35;
          } else if (elapsed < 70) {
            visibilityFactor = 0.0;
            flashOpacity = 0.0;
          } else if (elapsed < 120) {
            visibilityFactor = 0.8;
            flashOpacity = 0.2;
          } else {
            visibilityFactor = 0.8 * (1 - (elapsed - 120) / (strikeDuration - 120));
            flashOpacity = 0.2 * (1 - (elapsed - 120) / (strikeDuration - 120));
          }

          if (flashOpacity > 0) {
            ctx.fillStyle = `rgba(255, 255, 255, ${flashOpacity * 0.4})`;
            ctx.fillRect(0, 0, width, height);
          }

          for (const bolt of activeBolts) {
            ctx.beginPath();
            ctx.moveTo(bolt.points[0].x, bolt.points[0].y);
            for (let i = 1; i < bolt.points.length; i++) {
              ctx.lineTo(bolt.points[i].x, bolt.points[i].y);
            }

            ctx.strokeStyle = colorRef.current;
            ctx.shadowColor = glowRef.current;
            ctx.shadowBlur = bolt.isBranch ? 8 : 20;
            ctx.lineWidth = bolt.width;
            ctx.globalAlpha = bolt.alpha * visibilityFactor;
            ctx.stroke();

            ctx.strokeStyle = '#ffffff';
            ctx.shadowBlur = 0;
            ctx.lineWidth = bolt.width * 0.3;
            ctx.stroke();
            
            ctx.globalAlpha = 1.0;
          }
        }
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div style={{
      position: 'relative',
      height: '100vh',
      minHeight: '600px',
      width: '100%',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'var(--bg-base)',
    }}>
      {/* Background Image with Next.js Image and Parallax */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '120%',
        transform: `translateY(${scrollY * 0.3}px)`,
        zIndex: 0,
      }}>
        <Image
          src="/images/storm-clouds.png"
          alt="Storm Clouds Background"
          fill
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1920px"
          style={{
            objectFit: 'cover',
            objectPosition: 'center',
          }}
        />
      </div>

      {/* Canvas lightning bolt overlaid */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* Cinematic Gradient Overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'linear-gradient(to top, var(--bg-base) 10%, rgba(10, 10, 10, 0.1) 100%)',
        zIndex: 2,
      }} />

      {/* Hero Content Overlay */}
      <div style={{
        position: 'relative',
        zIndex: 3,
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '0 20px',
      }}>
        {/* WhiteStorm.png Logo Image instead of text "AASIFA" */}
        <div style={{ marginBottom: '25px', display: 'flex', justifyContent: 'center', width: '100%' }}>
          <Image
            src="/images/WhiteStorm.png"
            alt="WhiteStorm"
            width={550}
            height={180}
            priority
            style={{
              width: '70%',
              maxWidth: '420px',
              height: 'auto',
              maxHeight: 'clamp(60px, 12vh, 110px)',
              objectFit: 'contain',
              filter: 'drop-shadow(0 0 25px rgba(255,255,255,0.25))'
            }}
          />
        </div>

        {/* Moody subtitle */}
        <p style={{
          fontSize: 'clamp(0.9rem, 2vw, 1.1rem)',
          color: 'var(--text-muted)',
          maxWidth: '500px',
          lineHeight: '1.6',
          marginBottom: '40px',
          fontWeight: 300,
          letterSpacing: '0.05em',
        }}>
          {t('brand.slogan')}
        </p>

        {/* CTA Button */}
        <a href="#shop" className="btn-primary">
          {t('explore.collection')}
        </a>
      </div>
    </div>
  );
}
