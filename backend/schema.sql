-- Gram Koldiha Durga Puja — PIN 231210, Sonbhadra / Mirzapur, UP
create extension if not exists "pgcrypto";
create type user_role as enum ('villager','volunteer','committee','treasurer','admin');
create type volunteer_status as enum ('pending','approved','rejected');
create type payment_method as enum ('upi','cash','bank','other');
create table profiles (id uuid primary key default gen_random_uuid(), name text not null, phone text unique, email text, role user_role not null default 'villager', photo_url text, created_at timestamptz default now());
create table events (id uuid primary key default gen_random_uuid(), title text not null, description text, day_name text, event_date date not null, start_time time, end_time time, location text default 'दुर्गा पूजा पंडाल, ग्राम कोलडिहा', sort_order int default 0);
create table announcements (id uuid primary key default gen_random_uuid(), title text not null, message text not null, image_url text, pinned boolean default false, created_at timestamptz default now());
create table committee_members (id uuid primary key default gen_random_uuid(), name text not null, position text not null, phone text, photo_url text, sort_order int default 0);
create table gallery (id uuid primary key default gen_random_uuid(), image_url text not null, caption text, category text, year int default 2026, created_at timestamptz default now());
create table donations (id uuid primary key default gen_random_uuid(), donor_name text not null, amount numeric(12,2) not null check (amount > 0), payment_method payment_method default 'cash', transaction_id text, collector text, created_at timestamptz default now());
create table expenses (id uuid primary key default gen_random_uuid(), title text not null, amount numeric(12,2) not null check (amount > 0), category text, bill_url text, expense_date date default current_date);
create table volunteers (id uuid primary key default gen_random_uuid(), name text not null, phone text not null, service_type text not null, status volunteer_status default 'pending', created_at timestamptz default now());
create table settings (key text primary key, value text);
insert into settings(key, value) values ('village','ग्राम कोलडिहा'),('pincode','231210'),('district','सोनभद्र / मिर्ज़ापुर'),('state','उत्तर प्रदेश'),('puja_start','2026-10-16'),('puja_end','2026-10-20'),('aarti_time','19:00'),('live_youtube',''),('upi_id',''),('maps_query','Gram Koldiha 231210 Sonbhadra Uttar Pradesh');
