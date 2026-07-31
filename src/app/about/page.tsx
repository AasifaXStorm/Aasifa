import React from 'react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div style={{
      background: '#030303',
      minHeight: 'calc(100vh - 70px)',
      padding: '80px 5%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        maxWidth: '750px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '40px',
      }}>
        {/* Arabic Header */}
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '1.2rem', color: '#555555', letterSpacing: '0.4em', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>
            عاصفة
          </span>
          <h1 className="brand-title" style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '20px' }}>
            AASIFA
          </h1>
          <div style={{ width: '40px', height: '1px', background: '#333333', margin: '0 auto' }}></div>
        </div>

        {/* Narrative Paragraphs */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          color: '#b0b0b0',
          fontSize: '1rem',
          lineHeight: '1.8',
          fontWeight: 300,
          letterSpacing: '0.02em',
        }}>
          <p>
            Established in 2026, <strong>Aasifa</strong> (meaning <em>&ldquo;storm&rdquo;</em> in Arabic) is a streetwear conceptual label born from the kinetic energy of raw atmospheric chaos. We construct dark, minimal garments meant to serve as armor against the urban elements.
          </p>
          <p>
            Our design language is rooted in silence before the strike. By utilizing heavy cottons, architectural drop-shoulder silhouettes, and a strict monochrome palette of deep obsidian blacks and asphalt grays, we focus purely on proportion, texture, and form.
          </p>
          <p>
            Each piece is made in limited batches, ensuring the highest standards of materials and cut. Aasifa is not just apparel; it is a cinematic atmosphere translated into physical armor.
          </p>
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Link href="/#shop" className="btn-primary" style={{ display: 'inline-block' }}>
            Shop The Drop
          </Link>
        </div>
      </div>
    </div>
  );
}
