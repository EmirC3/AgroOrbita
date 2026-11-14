-- RNF-004: cada agricultor ve y modifica solo sus propias parcelas, siembras y cosechas.
-- Correr en Supabase → SQL Editor DESPUÉS de crear las tablas con `npx drizzle-kit push`.

-- 1. user_id ligado a la cuenta de Supabase y con valor por defecto = usuario actual
alter table parcelas alter column user_id set default auth.uid();
alter table siembras alter column user_id set default auth.uid();
alter table cosechas alter column user_id set default auth.uid();

alter table parcelas add constraint parcelas_user_fk foreign key (user_id) references auth.users(id) on delete cascade;
alter table siembras add constraint siembras_user_fk foreign key (user_id) references auth.users(id) on delete cascade;
alter table cosechas add constraint cosechas_user_fk foreign key (user_id) references auth.users(id) on delete cascade;

-- 2. Activar RLS
alter table parcelas enable row level security;
alter table siembras enable row level security;
alter table cosechas enable row level security;

-- 3. Parcelas: solo las mías
create policy "parcelas_propias" on parcelas
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- 4. Siembras: solo las mías, y solo en parcelas mías
create policy "siembras_propias" on siembras
  for all to authenticated
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and exists (select 1 from parcelas p where p.id = parcela_id and p.user_id = auth.uid())
  );

-- 5. Cosechas: solo las mías, y solo de siembras mías
create policy "cosechas_propias" on cosechas
  for all to authenticated
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and exists (select 1 from siembras s where s.id = siembra_id and s.user_id = auth.uid())
  );

-- 6. Índices para las consultas de la API
create index if not exists siembras_parcela_idx on siembras (parcela_id);
create index if not exists parcelas_user_idx on parcelas (user_id);

-- Prueba de aceptación RNF-004: inicia sesión con dos cuentas de ejemplo y verifica
-- que GET /api/parcelas de una no muestre nada de la otra.
