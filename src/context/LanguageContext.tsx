'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'ar';

interface LanguageContextProps {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

const translations: Record<string, Record<Language, string>> = {
  // Brand/Slogans
  'brand.title': { en: 'AASIFA', ar: 'عاصفة' },
  'brand.slogan': { en: 'STORM IN YOUR STYLE.', ar: 'العاصفة في أسلوبك.' },
  'explore.collection': { en: 'Explore Collection', ar: 'اكتشف المجموعة' },
  'about.blurb': {
    en: 'A cinematic force of nature translated into minimal, dark-themed streetwear.',
    ar: 'قوة سينمائية من الطبيعة مترجمة إلى ملابس شارع بأسلوب بسيط ومظلم.'
  },
  'about.blurb.drawer': {
    en: 'Inspired by the cinematic force of nature. Dark, moody, minimal streetwear designed to withstand the storm.',
    ar: 'مستوحى من القوة السينمائية للطبيعة. ملابس شارع غامضة وبسيطة مصممة لتحمل العاصفة.'
  },
  
  // Navigation / Links
  'nav.home': { en: 'HOME', ar: 'الرئيسية' },
  'nav.shop': { en: 'SHOP', ar: 'المتجر' },
  'nav.about': { en: 'ABOUT THE BRAND', ar: 'عن العلامة التجارية' },
  'nav.contact': { en: 'CONTACT US', ar: 'اتصل بنا' },
  'nav.instagram': { en: 'Instagram', ar: 'إنستغرام' },
  
  // Homepage content
  'home.selected': { en: 'Selected Pieces', ar: 'قطع مختارة' },
  'home.collection_title': { en: 'The Storm Collection', ar: 'مجموعة العاصفة' },
  'home.out_of_stock': { en: 'OUT OF STORM', ar: 'نفدت من العاصفة' },
  'home.preparing': {
    en: 'We are currently preparing the next drop. Access the administration portal to manage inventory and list new items.',
    ar: 'نحن نقوم بالتحضير للمجموعة القادمة حالياً. تفضل بزيارة بوابة الإدارة لإدارة المخزون وإدراج سلع جديدة.'
  },
  'home.manage': { en: 'Manage Inventory', ar: 'إدارة المخزون' },
  'home.no_items': {
    en: 'No items found in category.',
    ar: 'لم يتم العثور على سلع في هذه الفئة.'
  },
  'home.cat.all': { en: 'ALL', ar: 'الكل' },
  'home.cat.shirts': { en: 'SHIRTS', ar: 'القمصان' },
  'home.cat.hoodies': { en: 'HOODIES', ar: 'الهوديز' },
  'home.cat.pants': { en: 'PANTS', ar: 'البنطال' },
  'home.cat.accessories': { en: 'ACCESSORIES', ar: 'الإكسسوارات' },

  // Cart page
  'cart.title': { en: 'YOUR CART', ar: 'حقيبة التسوق' },
  'cart.empty': { en: 'Your cart is empty', ar: 'حقيبة التسوق فارغة' },
  'cart.subtotal': { en: 'Subtotal', ar: 'المجموع الفرعي' },
  'cart.shipping': { en: 'Shipping', ar: 'الشحن' },
  'cart.free': { en: 'FREE', ar: 'مجاني' },
  'cart.total': { en: 'Total', ar: 'الإجمالي' },
  'cart.checkout': { en: 'Checkout', ar: 'الدفع' },
  'cart.promo': { en: 'Promo Code', ar: 'رمز الخصم' },
  'cart.apply': { en: 'Apply', ar: 'تطبيق' },
  'cart.applied': { en: 'Applied', ar: 'تم التطبيق' },
  'cart.shipping_info': { en: 'Shipping Information', ar: 'معلومات الشحن' },
  'cart.name': { en: 'Full Name', ar: 'الاسم الكامل' },
  'cart.email': { en: 'Email Address', ar: 'البريد الإلكتروني' },
  'cart.place_order': { en: 'Place Order', ar: 'إتمام الطلب' },
  'cart.success': { en: 'Order Placed Successfully!', ar: 'تم تقديم الطلب بنجاح!' },
  'cart.order_id': { en: 'Your Order ID is:', ar: 'رقم طلبك هو:' },
  'cart.thank_you': { en: 'Thank you for shopping with Aasifa. We will contact you soon.', ar: 'شكرًا لتسوقك من عاصفة. سنتصل بك قريبًا.' },

  // Contact / About Pages
  'contact.title': { en: 'Contact Us', ar: 'اتصل بنا' },
  'contact.connect': { en: 'Connect', ar: 'تواصل معنا' },
  'contact.blurb': {
    en: 'Have queries regarding order tracking, size variants, or collaborations? Reach out and our team will get back to you.',
    ar: 'لديك استفسارات بخصوص تتبع الطلب، أو مقاسات معينة، أو تعاون خاص؟ تواصل معنا وسيقوم فريقنا بالرد عليك.'
  },
  'contact.email_support': { en: 'Email Support', ar: 'الدعم عبر البريد' },
  'contact.instagram_dm': { en: 'Instagram DM', ar: 'رسائل إنستغرام' },
  'contact.hours': { en: 'Support Hours', ar: 'ساعات العمل' },
  'contact.days': { en: 'Sunday – Thursday, 10 AM – 6 PM EST', ar: 'الأحد - الخميس، 10 صباحًا - 6 مساءً بتوقيت شرق أمريكا' },
  'contact.send_email': { en: 'Send us an Email', ar: 'أرسل لنا بريدًا إلكترونيًا' },

  // Product detail page
  'product.select_size': { en: 'Select Size', ar: 'اختر المقاس' },
  'product.out_of_stock': { en: 'Out of Storm', ar: 'نفد من العاصفة' },
  'product.add_to_cart': { en: 'Add to Cart', ar: 'أضف إلى الحقيبة' },
  'product.adding': { en: 'Adding...', ar: 'جاري الإضافة...' },
  'product.added': { en: 'Added to Cart', ar: 'تمت الإضافة للحقيبة' },
  'product.only_left': { en: '{qty} left in stock', ar: 'متبقي {qty} فقط في المخزن' },
  'product.details': { en: 'Product Details', ar: 'تفاصيل المنتج' },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'ar' : 'en'));
  };

  const t = (key: string): string => {
    const val = translations[key];
    if (!val) return key;
    return val[language] || val['en'];
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      <div dir={language === 'ar' ? 'rtl' : 'ltr'} style={{ transition: 'direction 0.3s' }}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}
