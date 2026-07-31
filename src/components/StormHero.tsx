'use client';

import React, { useEffect, useRef } from 'react';

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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Dynamic resize handler
    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Initialize cloud particles for horizontal parallax drift
    const clouds: Cloud[] = [];
    const numClouds = 12;
    for (let i = 0; i < numClouds; i++) {
      clouds.push({
        x: Math.random() * width,
        y: Math.random() * (height * 0.7), // keep clouds in upper 70% of screen
        radius: 200 + Math.random() * 250,
        opacity: 0.15 + Math.random() * 0.25,
        speed: 0.05 + Math.random() * 0.1, // very slow horizontal drift
      });
    }

    // Lightning state
    let activeBolts: Bolt[] = [];
    let flashOpacity = 0;
    let nextStrikeTime = Date.now() + 1000 + Math.random() * 3000; // first strike soon
    let strikeDuration = 300; // ms
    let strikeStartTime = 0;
    let isStriking = false;

    // Helper: Generate jagged line path using midpoint displacement
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
        // Offset horizontally
        const offset = (Math.random() - 0.5) * disp;
        const newX = midX + offset;

        divide(x1, y1, newX, midY, disp / 2);
        divide(newX, midY, x2, y2, disp / 2);
      }

      divide(startX, startY, endX, endY, displace);
      // Sort points by vertical coordinate so it draws top-to-bottom
      points.sort((a, b) => a.y - b.y);
      return points;
    }

    // Helper: Create a main bolt and optional branches
    function createLightningStrike() {
      const startX = width * 0.2 + Math.random() * (width * 0.6); // keep in mid 60% of viewport
      const startY = 0;
      const endX = startX + (Math.random() - 0.5) * (width * 0.3);
      const endY = height * 0.5 + Math.random() * (height * 0.5); // strikes down to lower half

      const mainBoltPath = generateJaggedPath(startX, startY, endX, endY, 150);
      const bolts: Bolt[] = [
        {
          points: mainBoltPath,
          width: 2 + Math.random() * 2,
          alpha: 1.0,
          isBranch: false,
        },
      ];

      // Add branches
      const branchCount = Math.floor(Math.random() * 3); // 0 to 2 branches
      for (let i = 0; i < branchCount; i++) {
        // Pick a random point along the main path to branch off
        if (mainBoltPath.length < 10) continue;
        const branchIdx = Math.floor(Math.random() * (mainBoltPath.length - 5)) + 2;
        const branchStart = mainBoltPath[branchIdx];
        
        // Branch direction is angled outwards
        const isLeft = Math.random() > 0.5;
        const branchEndX = branchStart.x + (isLeft ? -1 : 1) * (100 + Math.random() * 150);
        const branchEndY = branchStart.y + (150 + Math.random() * 200);

        const branchPath = generateJaggedPath(
          branchStart.x,
          branchStart.y,
          branchEndX,
          Math.min(branchEndY, height),
          60
        );

        bolts.push({
          points: branchPath,
          width: 1 + Math.random() * 1.5,
          alpha: 0.75,
          isBranch: true,
        });
      }

      return bolts;
    }

    // Render loop
    const render = () => {
      const now = Date.now();

      // Clear with dark storm gradient (deep dark charcoal to absolute black)
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#040406');
      bgGrad.addColorStop(0.5, '#020203');
      bgGrad.addColorStop(1, '#000000');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Draw clouds (parallax drift)
      for (const cloud of clouds) {
        // Update horizontal position
        cloud.x += cloud.speed;
        if (cloud.x - cloud.radius > width) {
          cloud.x = -cloud.radius;
        }

        // Cloud gradient
        const cloudGrad = ctx.createRadialGradient(
          cloud.x,
          cloud.y,
          0,
          cloud.x,
          cloud.y,
          cloud.radius
        );
        cloudGrad.addColorStop(0, `rgba(15, 15, 20, ${cloud.opacity})`);
        cloudGrad.addColorStop(0.5, `rgba(6, 6, 8, ${cloud.opacity * 0.4})`);
        cloudGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = cloudGrad;
        ctx.beginPath();
        ctx.arc(cloud.x, cloud.y, cloud.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Check if it's time for a new lightning strike
      if (!isStriking && now >= nextStrikeTime) {
        activeBolts = createLightningStrike();
        strikeStartTime = now;
        isStriking = true;
      }

      // Render lightning strike and handle flickers
      if (isStriking) {
        const elapsed = now - strikeStartTime;

        if (elapsed >= strikeDuration) {
          // Strike finished
          isStriking = false;
          activeBolts = [];
          flashOpacity = 0;
          nextStrikeTime = now + 4000 + Math.random() * 6000; // strike every 4-10s
        } else {
          // Complex flicker pattern to simulate real lightning behavior
          let visibilityFactor = 0;
          if (elapsed < 50) {
            visibilityFactor = 1.0; // Initial massive flash
            flashOpacity = 0.5;
          } else if (elapsed < 80) {
            visibilityFactor = 0.0; // Quick blackout
            flashOpacity = 0.0;
          } else if (elapsed < 140) {
            visibilityFactor = 0.8; // Second pulse
            flashOpacity = 0.35;
          } else if (elapsed < 180) {
            visibilityFactor = 0.1; // Dimming down
            flashOpacity = 0.05;
          } else {
            // Final decay
            visibilityFactor = 0.9 * (1 - (elapsed - 180) / (strikeDuration - 180));
            flashOpacity = 0.3 * (1 - (elapsed - 180) / (strikeDuration - 180));
          }

          // Draw the screen-wide ambient light flash
          if (flashOpacity > 0) {
            ctx.fillStyle = `rgba(235, 243, 255, ${flashOpacity * 0.8})`;
            ctx.fillRect(0, 0, width, height);
          }

          // Draw each bolt path
          for (const bolt of activeBolts) {
            ctx.beginPath();
            ctx.moveTo(bolt.points[0].x, bolt.points[0].y);
            for (let i = 1; i < bolt.points.length; i++) {
              ctx.lineTo(bolt.points[i].x, bolt.points[i].y);
            }

            // Glow styling
            ctx.strokeStyle = '#ffffff';
            ctx.shadowColor = '#e8f4fd';
            ctx.shadowBlur = bolt.isBranch ? 10 : 25;
            ctx.lineWidth = bolt.width;
            ctx.globalAlpha = bolt.alpha * visibilityFactor;
            ctx.stroke();

            // Core hot-white line
            ctx.strokeStyle = '#ffffff';
            ctx.shadowBlur = 0;
            ctx.lineWidth = bolt.width * 0.4;
            ctx.stroke();
            
            ctx.globalAlpha = 1.0; // reset
          }
        }
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    // Clean up animation loop and event listeners
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100vh',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      {/* Background Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1,
        }}
      />

      {/* Hero Content Overlay */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '0 20px',
      }}>
        {/* Arabic subhead */}
        <span style={{
          fontSize: '1rem',
          color: '#888888',
          letterSpacing: '0.3em',
          marginBottom: '15px',
          fontWeight: 300,
          textTransform: 'uppercase',
        }}>
          عاصفة
        </span>

        {/* Brand Title */}
        <h1 className="brand-title" style={{
          fontSize: 'clamp(2.5rem, 8vw, 5.5rem)',
          lineHeight: '1.1',
          marginBottom: '30px',
        }}>
          AASIFA
        </h1>

        {/* Moody subtitle */}
        <p style={{
          fontSize: 'clamp(0.9rem, 2vw, 1.1rem)',
          color: '#b0b0b0',
          maxWidth: '500px',
          lineHeight: '1.6',
          marginBottom: '40px',
          fontWeight: 300,
          letterSpacing: '0.05em',
        }}>
          Minimalist streetwear crafted to survive the storm.
        </p>

        {/* CTA Button */}
        <a href="#shop" className="btn-primary">
          Explore Collection
        </a>
      </div>

      {/* Bottom fade out to seamlessly transition to product list */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '150px',
        background: 'linear-gradient(to top, #030303 0%, rgba(3, 3, 3, 0) 100%)',
        zIndex: 2,
        pointerEvents: 'none',
      }} />
    </div>
  );
}
