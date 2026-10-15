-- VitrineMix: schema inicial. Execute no SQL Editor de um projeto Supabase NOVO.
-- Não execute no projeto usado pelo PedeFácil.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 2 and 80),
  phone text,
  neighborhood text,
  city text not null default 'Campos dos Goytacazes',
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 3 and 100),
  description text not null default '' check (char_length(description) <= 3000),
  category text not null,
  price numeric(10,2) not null check (price >= 0),
  condition text not null default 'Usado',
  variation text,
  status text not null default 'available'
    check (status in ('available','sold','paused','archived','pending')),
  city text not null default 'Campos dos Goytacazes',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_photos (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  storage_path text not null,
  sort_order smallint not null default 0 check (sort_order between 0 and 3),
  created_at timestamptz not null default now(),
  unique(product_id, sort_order)
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  reporter_id uuid references public.profiles(id) on delete set null,
  reason text not null,
  details text,
  status text not null default 'open' check (status in ('open','reviewing','resolved','dismissed')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.product_photos enable row level security;
alter table public.reports enable row level security;

-- Perfil: público pode consultar dados básicos do vendedor; somente dono edita o próprio perfil.
create policy "profiles are readable" on public.profiles
for select using (true);
create policy "users insert own profile" on public.profiles
for insert to authenticated with check (auth.uid() = id);
create policy "users update own profile" on public.profiles
for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- Vitrine pública só mostra anúncios disponíveis; vendedor gerencia os próprios.
create policy "public reads available products" on public.products
for select using (status = 'available' or auth.uid() = seller_id);
create policy "seller inserts own products" on public.products
for insert to authenticated with check (auth.uid() = seller_id);
create policy "seller updates own products" on public.products
for update to authenticated using (auth.uid() = seller_id) with check (auth.uid() = seller_id);
create policy "seller deletes own products" on public.products
for delete to authenticated using (auth.uid() = seller_id);

create policy "photos follow visible product" on public.product_photos
for select using (
  exists (select 1 from public.products p where p.id = product_id and
    (p.status = 'available' or p.seller_id = auth.uid()))
);
create policy "seller adds photos to own product" on public.product_photos
for insert to authenticated with check (
  exists (select 1 from public.products p where p.id = product_id and p.seller_id = auth.uid())
);
create policy "seller updates photos of own product" on public.product_photos
for update to authenticated using (
  exists (select 1 from public.products p where p.id = product_id and p.seller_id = auth.uid())
) with check (
  exists (select 1 from public.products p where p.id = product_id and p.seller_id = auth.uid())
);
create policy "seller removes photos of own product" on public.product_photos
for delete to authenticated using (
  exists (select 1 from public.products p where p.id = product_id and p.seller_id = auth.uid())
);

-- Denúncias: usuário autenticado pode registrar; leitura/moderação administrativa será adicionada
-- com uma política de papel admin antes de abrir a plataforma ao público.
create policy "authenticated users report products" on public.reports
for insert to authenticated with check (reporter_id = auth.uid() or reporter_id is null);

-- Storage: crie o bucket product-photos como público pelo painel antes de ativar uploads.
-- Políticas de Storage serão configuradas na etapa de upload, limitando caminhos por usuário.
