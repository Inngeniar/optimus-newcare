-- ==============================================================================
-- SCRIPT DE INICIALIZACION DE BASE DE DATOS: SUPABASE (POSTGRESQL)
-- PROYECTO: PORTAFOLIO DE SERVICIOS Y COSTEO NEWCARE - OPTIMUS HEALTH IPS
-- ==============================================================================

-- 1. Tabla: Propuestas Comerciales y Cotizaciones (Multi-usuario)
create table if not exists public.newcare_propuestas (
    id text primary key,
    numero_referencia text not null,
    entidad_aseguradora text not null,
    atencion_destinatario text,
    fecha_propuesta text not null,
    nombre_producto text not null,
    modalidad text default 'Domiciliaria',
    complejidad text default 'Alta',
    poblacion_cohorte integer default 100,
    margen_comercial numeric(5, 4) default 0.2500,
    costo_tecnico_total numeric(14, 2) not null,
    precio_sugerido_mes numeric(14, 2) not null,
    utilidad_unitaria numeric(14, 2) default 0,
    facturacion_mensual numeric(16, 2) not null,
    facturacion_anual numeric(16, 2) not null,
    version_propuesta text default 'client', -- 'client' (aseguradora) o 'internal' (tecnica)
    desglose_servicios jsonb not null,       -- Array completo de servicios con estado, frec, tarifa y costo
    estado text default 'Borrador',          -- 'Borrador', 'Enviada', 'En Negociacion', 'Aprobada'
    creado_por text default 'Optimus Health',
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Habilitar RLS (Row Level Security) y politicas de lectura/escritura publica (anon)
alter table public.newcare_propuestas enable row level security;

create policy "Permitir lectura publica a propuestas NewCare"
on public.newcare_propuestas for select
using (true);

create policy "Permitir insercion y actualizacion publica a propuestas NewCare"
on public.newcare_propuestas for all
using (true)
with check (true);

-- 2. Tabla: Productos Base del Portafolio Institucional
create table if not exists public.newcare_productos_base (
    id text primary key,
    codigo text not null,
    nombre text not null,
    modalidad text not null,
    complejidad text not null,
    descripcion text,
    costo_tecnico_base numeric(14, 2) not null,
    precio_sugerido_base numeric(14, 2) not null,
    tarifa_mercado_referencia numeric(14, 2),
    configuracion jsonb not null,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

alter table public.newcare_productos_base enable row level security;

create policy "Permitir lectura publica a productos base"
on public.newcare_productos_base for select
using (true);

create policy "Permitir escritura publica a productos base"
on public.newcare_productos_base for all
using (true)
with check (true);

-- 3. Tabla: Registro de Actividad Colaborativa / Auditoria
create table if not exists public.newcare_auditoria_cambios (
    id bigserial primary key,
    propuesta_id text not null,
    usuario text default 'Usuario Optimus',
    accion text default 'PROPUESTA_GUARDADA',
    detalles text,
    fecha timestamptz default now()
);

alter table public.newcare_auditoria_cambios enable row level security;

create policy "Permitir auditoria publica NewCare"
on public.newcare_auditoria_cambios for all
using (true)
with check (true);

-- 4. Insercion de los 4 Modelos Base NEWCARE de Referencia
insert into public.newcare_productos_base (id, codigo, nombre, modalidad, complejidad, descripcion, costo_tecnico_base, precio_sugerido_base, tarifa_mercado_referencia, configuracion)
values
  ('NC-AMB-MED', 'AMB-MED', 'Ambulatorio Media Complejidad', 'Ambulatoria', 'Media', 'Barthel 61-90, NYHA II, GOLD II, ERC 3. Manejo periodico en sede UCC.', 1712.30, 2283.07, 2329.70, '{"tipo": "ambulatorio", "complejidad": "media"}'::jsonb),
  ('NC-AMB-ALT', 'AMB-ALT', 'Ambulatorio Alta Complejidad', 'Ambulatoria', 'Alta', 'Barthel <60, NYHA III-IV, GOLD III-IV, ERC 4-5. Soporte continuo en sede UCC.', 2947.26, 3929.68, 2329.70, '{"tipo": "ambulatorio", "complejidad": "alta"}'::jsonb),
  ('NC-DOM-MED', 'DOM-MED', 'Domiciliario Media Complejidad', 'Domiciliaria', 'Media', 'Limitacion funcional moderada, seguimiento en hogar, cuidadores entrenados PAD.', 4281.26, 5708.35, 5480.26, '{"tipo": "domiciliario", "complejidad": "media"}'::jsonb),
  ('NC-DOM-ALT', 'DOM-ALT', 'Domiciliario Alta Complejidad', 'Domiciliaria', 'Alta', 'Dependencia severa, fragilidad clinica extrema, soporte asistencial frecuente PAD.', 6679.26, 8905.68, 5480.26, '{"tipo": "domiciliario", "complejidad": "alta"}'::jsonb)
on conflict (id) do nothing;
