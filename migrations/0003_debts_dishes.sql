-- Debts ledger (open / paid / removed) and extra dish tiles for admin

create table if not exists debts (
  id serial primary key,
  reservation_id integer references reservations(id) on delete set null,
  name text not null,
  phone text not null,
  amount_cents integer not null default 1000,
  service_date date not null,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists debts_status_idx on debts (status);
create index if not exists debts_reservation_idx on debts (reservation_id);

create table if not exists custom_dishes (
  id serial primary key,
  name text not null,
  photo_url text,
  notes text,
  created_at timestamptz not null default now()
);
