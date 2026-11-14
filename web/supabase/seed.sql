-- RF-010: 3 agricultores de ejemplo para la demo (RN-002: son datos de ejemplo).
--
-- PASO 1 (a mano, 2 minutos): en Supabase → Authentication → Users → "Add user",
-- crear estas 3 cuentas con contraseña y marcando "Auto confirm user":
--   don.jose@ejemplo.agroorbita.mx
--   dona.maria@ejemplo.agroorbita.mx
--   don.pedro@ejemplo.agroorbita.mx
-- Recomendado para la demo: Authentication → Providers → Email → desactivar "Confirm email".
--
-- PASO 2: correr este archivo en el SQL Editor.
-- Cambia los municipios por los que estén en datos/municipios.json.

-- Don José: 3 temporadas de maíz seguidas → dispara la alerta de suelo cansado (RF-015)
with u as (select id from auth.users where email = 'don.jose@ejemplo.agroorbita.mx'),
p as (
  insert into parcelas (user_id, nombre, municipio, lat, lon)
  select id, 'La milpa del cerro (ejemplo)', 'tekax', 20.20, -89.29 from u
  returning id, user_id
)
insert into siembras (user_id, parcela_id, cultivo, temporada, fecha_siembra, rendimiento_pronosticado_t_ha)
select p.user_id, p.id, 'maiz', t.temporada, t.fecha::date, 1.2
from p, (values (2023, '2023-06-05'), (2024, '2024-06-10'), (2025, '2025-06-02')) as t(temporada, fecha);

-- Doña María: rota maíz y frijol, con cosechas registradas (RF-013, RF-014)
with u as (select id from auth.users where email = 'dona.maria@ejemplo.agroorbita.mx'),
p as (
  insert into parcelas (user_id, nombre, municipio, lat, lon)
  select id, 'Parcela k''ankab (ejemplo)', 'ticul', 20.40, -89.54 from u
  returning id, user_id
),
s as (
  insert into siembras (user_id, parcela_id, cultivo, temporada, fecha_siembra, rendimiento_pronosticado_t_ha)
  select p.user_id, p.id, t.cultivo, t.temporada, t.fecha::date, t.pron
  from p, (values ('maiz', 2024, '2024-06-03', 1.25), ('frijol', 2025, '2025-06-16', 0.6)) as t(cultivo, temporada, fecha, pron)
  returning id, user_id, rendimiento_pronosticado_t_ha
)
insert into cosechas (user_id, siembra_id, rendimiento_t_ha, diferencia_pct)
select user_id, id, round((rendimiento_pronosticado_t_ha * 0.8)::numeric, 2),
       -20.0  -- 20 % menos de lo pronosticado: prueba de aceptación de RF-014
from s;

-- Don Pedro: cuenta nueva sin parcelas (para mostrar el registro en vivo)
-- Solo necesita existir en auth.users.
