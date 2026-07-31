-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Products Table
create table if not exists products (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  price numeric(10, 2) not null,
  category text default 'Shirts',
  images text[] default '{}',
  created_at timestamptz default now()
);

-- Product Variants (Size & Stock)
create table if not exists product_variants (
  id uuid default uuid_generate_v4() primary key,
  product_id uuid references products(id) on delete cascade not null,
  size text not null,
  stock_quantity integer default 0 not null,
  unique(product_id, size)
);

-- Orders Table
create table if not exists orders (
  id uuid default uuid_generate_v4() primary key,
  customer_name text not null,
  customer_email text not null,
  total_amount numeric(10, 2) not null,
  status text default 'pending' not null, -- pending, completed, cancelled
  created_at timestamptz default now()
);

-- Order Items
create table if not exists order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references orders(id) on delete cascade not null,
  product_variant_id uuid references product_variants(id) on delete restrict not null,
  quantity integer not null,
  unit_price numeric(10, 2) not null
);

-- Enable RLS (Row Level Security)
alter table products enable row level security;
alter table product_variants enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- Drop existing policies if they exist to avoid duplication errors on re-run
drop policy if exists "Allow public read on products" on products;
drop policy if exists "Allow admin write on products" on products;
drop policy if exists "Allow public read on product_variants" on product_variants;
drop policy if exists "Allow admin write on product_variants" on product_variants;
drop policy if exists "Allow anyone to insert orders" on orders;
drop policy if exists "Allow admin read/write on orders" on orders;
drop policy if exists "Allow anyone to insert order_items" on order_items;
drop policy if exists "Allow admin read/write on order_items" on order_items;

-- Setup RLS Policies:
-- 1. Products & Variants: Read access for everyone (anon), write access for authenticated users (admin).
create policy "Allow public read on products" on products for select using (true);
create policy "Allow admin write on products" on products for all using (auth.role() = 'authenticated');

create policy "Allow public read on product_variants" on product_variants for select using (true);
create policy "Allow admin write on product_variants" on product_variants for all using (auth.role() = 'authenticated');

-- 2. Orders & Order Items: Anyone can create orders (to allow checkouts), only admins can read/update them.
create policy "Allow anyone to insert orders" on orders for insert with check (true);
create policy "Allow admin read/write on orders" on orders for all using (auth.role() = 'authenticated');

create policy "Allow anyone to insert order_items" on order_items for insert with check (true);
create policy "Allow admin read/write on order_items" on order_items for all using (auth.role() = 'authenticated');
