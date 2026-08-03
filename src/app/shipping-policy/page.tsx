import React from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export const metadata = {
  title: 'Shipping & Returns | STORM',
  description: 'STORM Shipping & Returns Policy. Learn about our delivery conditions, phone confirmation calls, branch returns, and WhatsApp registration processes.',
};

export default function ShippingPolicyPage() {
  return (
    <div style={{
      background: 'var(--bg-base)',
      minHeight: '80vh',
      padding: '120px 5% 80px 5%',
      color: 'var(--text-primary)',
      fontFamily: 'var(--font-inter)',
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* Back Link */}
        <Link href="/" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          color: 'var(--text-muted)',
          fontSize: '0.85rem',
          marginBottom: '30px',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
        }}>
          <ChevronLeft size={16} /> Back to Home
        </Link>

        {/* Title */}
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 900,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          marginBottom: '40px',
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '20px'
        }}>
          ⚡ SHIPPING & RETURNS POLICY
        </h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', lineHeight: '1.8', fontSize: '0.95rem', color: '#b0b0b0' }}>
          
          {/* Section 1: Order Confirmation */}
          <section>
            <h2 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '15px' }}>
              1. MANDATORY PHONE CONFIRMATION
            </h2>
            <p>
              Once your checkout is completed, your package enters our confirmation phase. 
              <strong> Our sales team will call you within two (2) business days at varying times to verify your details by phone.</strong> 
              If we are unable to reach you after multiple attempts, your order will be automatically canceled. 
              Please ensure your phone line remains active and reachable during this window.
            </p>
          </section>

          {/* Section 2: Delivery Timelines */}
          <section>
            <h2 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '15px' }}>
              2. SHIPPING TIME & COURIER POLICIES
            </h2>
            <p>
              Deliveries are processed immediately after phone confirmation. 
              Packages will arrive at your address <strong>1 to 4 business days after the confirmation call is completed.</strong>
            </p>
            <p style={{ marginTop: '10px' }}>
              Please note: In accordance with strictly enforced courier guidelines, 
              <strong> packages cannot be opened prior to delivery or courier payment.</strong> 
              This policy is mandatory to preserve the factory condition of our streetwear garments. 
              If you refuse delivery at the door, the outbound shipping fees will be deducted from your account.
            </p>
          </section>

          {/* Section 3: Return Conditions */}
          <section>
            <h2 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '15px' }}>
              3. GENERAL RETURN & EXCHANGE RULES
            </h2>
            <p>
              We accept returns or exchanges within <strong>fourteen (14) days from the date of delivery.</strong> 
              To qualify, items must be in their original, unwashed, and unironed condition, complete with original tags, labels, packaging, invoice, and the shipping label intact.
            </p>
            <p style={{ marginTop: '10px' }}>
              <strong>Non-Returnable Items:</strong> Ironed/washed garments, damaged items, shoes without original packaging, products with removed tags, caps, accessories, wallets, swimwear, watches, and socks.
            </p>
            <p style={{ marginTop: '10px' }}>
              <strong>Outfit & Bundle Offers:</strong> Multi-piece promotional outfits or bundle offers must be returned in full. We cannot process partial returns or partial refunds on discounted bundles.
            </p>
          </section>

          {/* Section 4: Return Shipping Costs */}
          <section>
            <h2 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '15px' }}>
              4. RETURN SHIPPING FEES
            </h2>
            <p>
              Customers are responsible for return courier fees unless the item is verified as defective upon arrival.
            </p>
            <p style={{ marginTop: '10px' }}>
              <strong>Defective Item Policy:</strong>
              <br />
              • If the defective garment was the <em>only item</em> in your order, STORM covers all shipping fees to return/exchange the item.
              <br />
              • If your order included <em>other undamaged items</em> alongside the defective piece, STORM does not cover the initial return courier fee. However, we will cover the shipping fee to resend your replacement item.
            </p>
          </section>

          {/* Section 5: Refund Methods */}
          <section>
            <h2 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '15px' }}>
              5. INITIATION & REFUND PROCESSING
            </h2>
            <p>
              <strong>All returns must first be initialized and confirmed via WhatsApp.</strong> 
              Do not visit a store branch or ship items back before receiving written confirmation from our customer care team on WhatsApp.
            </p>
            <p style={{ marginTop: '10px' }}>
              <strong>Refund Channels:</strong>
              <br />
              • <strong>Store Branch Returns:</strong> Refunded on the spot in cash after our store staff manually inspects and verifies the condition of the garments.
              <br />
              • <strong>Courier-Based Returns:</strong> Once shipped, items undergo terminal inspection at our fulfillment facility (takes 7 to 10 business days). Approved returns will be refunded via <strong>Vodafone Cash</strong> or <strong>InstaPay</strong>.
            </p>
          </section>

        </div>

        {/* Back Button */}
        <div style={{ marginTop: '60px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
          <Link href="/" style={{
            color: '#fff',
            textDecoration: 'none',
            fontSize: '0.9rem',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            ← Back to Home
          </Link>
        </div>

      </div>
    </div>
  );
}
