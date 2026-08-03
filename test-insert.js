const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseSecretKey);

async function test() {
  try {
    console.log("Inserting test product...");
    const { data, error } = await supabaseAdmin
      .from('products')
      .insert({
        name: 'Test Shirt',
        description: 'Test description',
        price: 399.99,
        category: 'Shirts',
        images: ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80']
      })
      .select('id')
      .single();

    if (error) {
      console.error("Insert error:", error);
    } else {
      console.log("Insert success! New product ID:", data.id);
      
      console.log("Deleting test product...");
      const { error: delError } = await supabaseAdmin
        .from('products')
        .delete()
        .eq('id', data.id);
      if (delError) console.error("Delete error:", delError);
      else console.log("Delete success!");
    }
  } catch (err) {
    console.error("Unhandled error:", err);
  }
}

test();
