import React from 'react';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ProductDetailClient } from '@/components/ProductDetailClient';
import { Product } from '@/components/ProductCard';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;

  if (!id) {
    return notFound();
  }

  let product: Product | null = null;

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*, product_variants(*)')
      .eq('id', id)
      .single();

    if (error || !data) {
      console.error('Error fetching product detail:', error);
      return notFound();
    }

    if (data.category?.endsWith(' (Hidden)')) {
      return notFound();
    }

    product = {
      ...data,
      category: data.category ? data.category.replace(' (Hidden)', '') : 'Shirts'
    } as Product;
  } catch (err) {
    console.error('Catch fetching product detail:', err);
    return notFound();
  }

  return (
    <div style={{ background: '#030303', minHeight: 'calc(100vh - 70px)', paddingTop: '40px' }}>
      <ProductDetailClient product={product} />
    </div>
  );
}
