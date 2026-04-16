-- Rodar este script no SQL Editor do Supabase
-- https://supabase.com/dashboard/project/xvtuhtkfhnmzehsfmgsw/sql/new

create table if not exists registros (
  id uuid default gen_random_uuid() primary key,
  data date not null,
  usuario text not null check (usuario in ('joao_pedro', 'atanael')),
  empresas_encontradas integer not null default 0,
  leads_qualificados integer not null default 0,
  leads_enviados_crm integer not null default 0,
  leads_contatados integer not null default 0,
  respostas integer not null default 0,
  interessados integer not null default 0,
  reunioes_marcadas integer not null default 0,
  oportunidades integer not null default 0,
  created_at timestamptz default now()
);

-- Garante um registro por usuário por dia
create unique index if not exists registros_data_usuario_idx on registros (data, usuario);

-- Permite leitura e escrita sem autenticação (acesso público)
alter table registros enable row level security;

create policy "allow all" on registros
  for all
  using (true)
  with check (true);
