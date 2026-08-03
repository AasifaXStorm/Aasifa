'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';

export default function AboutPage() {
  const { language } = useTranslation();

  const englishParagraphs = [
    `In 2026, an 18-year-old boy dreamed of creating an Egyptian clothing brand with premium oversized T-shirts of world-class quality and eye-catching designs under the name "Aasifa X Storm." His vision is to see young people across the Arab world and around the globe wearing T-shirts that meet international standards while being proudly 100% Made in Egypt.`,
    `He chose the name "Aasifa" because it is unique, memorable, and powerful. Every product is designed with exceptional attention to detail, ensuring that each T-shirt is perfectly crafted from start to finish. From the fabric and stitching to the fit and overall design, nothing is overlooked.`,
    `Aasifa Brand is committed to using only the highest-quality printing technology, ensuring that every print remains durable and vibrant without peeling, cracking, or fading after washing or regular use. Every Aasifa T-shirt is made to deliver outstanding quality, comfort, and long-lasting performance.`,
    `With Aasifa, you can wear your T-shirt with complete confidence because quality is guaranteed. "You're always in safe hands with Aasifa ⚡"`
  ];

  const arabicParagraphs = [
    `في عام 2026، حلم شاب يبلغ من العمر 18 عاماً بتأسيس علامة تجارية مصرية للملابس تقدم تيشرتات فضفاضة (oversized) فاخرة بجودة عالمية وتصاميم لافتة للانتباه تحت اسم "Aasifa X Storm". وتتمثل رؤيته في رؤية الشباب في جميع أنحاء الوطن العربي والعالم يرتدون تيشرتات تلبي المعايير الدولية وتصنع بفخر بنسبة 100% في مصر.`,
    `لقد اختار اسم "عاصفة" لأنه فريد ومميز وقوي. تم تصميم كل منتج باهتمام استثنائي بالتفاصيل، مما يضمن أن كل تيشرت مصنوع بشكل مثالي من البداية إلى النهاية. من القماش والخياطة إلى الملاءمة والتصميم العام، لا يتم إغفال أي شيء.`,
    `تلتزم علامة عاصفة التجارية باستخدام تقنيات الطباعة الأعلى جودة فقط، مما يضمن بقاء كل طبعة متينة وحيوية دون تقشير أو تشقق أو تلاشي بعد الغسيل أو الاستخدام المنتظم. صُنع كل تيشرت من عاصفة لتقديم جودة استثنائية وراحة وأداء طويل الأمد.`,
    `مع عاصفة، يمكنك ارتداء التيشرت الخاص بك بثقة تامة لأن الجودة مضمونة، "أنت دائماً في أيدي أمينة مع عاصفة ⚡︎"`
  ];

  const paragraphs = language === 'ar' ? arabicParagraphs : englishParagraphs;
  const pageTitle = language === 'ar' ? 'عن العلامة التجارية' : 'ABOUT THE BRAND';

  return (
    <div style={{
      background: 'var(--bg-base)',
      minHeight: 'calc(100vh - 70px)',
      padding: 'clamp(40px, 8vw, 80px) 5%',
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
        {/* Back Link */}
        <Link href="/" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          color: 'var(--text-muted)',
          fontSize: '0.85rem',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          alignSelf: 'flex-start'
        }}>
          <ChevronLeft size={16} /> {language === 'ar' ? 'الرجوع للرئيسية' : 'Back to Home'}
        </Link>

        {/* Header */}
        <div style={{ textAlign: 'center' }}>
          <h1 className="brand-title" style={{ fontSize: 'clamp(1.6rem, 7vw, 2.5rem)', fontWeight: 900, marginBottom: '20px', letterSpacing: '0.2em' }}>
            {pageTitle}
          </h1>
          <div style={{ width: '40px', height: '1px', background: '#2a2a2a', margin: '0 auto' }}></div>
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
          textAlign: language === 'ar' ? 'right' : 'left',
        }}>
          {paragraphs.map((p, idx) => (
            <p key={idx}>{p}</p>
          ))}
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Link href="/#shop" className="btn-primary" style={{ display: 'inline-block' }}>
            {language === 'ar' ? 'تسوق المجموعة' : 'Shop The Drop'}
          </Link>
        </div>
      </div>
    </div>
  );
}
