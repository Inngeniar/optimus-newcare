-- ==============================================================================
-- SCRIPT DE INICIALIZACION DE BASE DE DATOS: SUPABASE (POSTGRESQL)
-- PROYECTO: VALORACION MULTIDIMENSIONAL (VMD) NEW CARE - OPTIMUS HEALTH
-- ==============================================================================

-- 1. Tabla: Directorio del Equipo de Salud Interdisciplinario
create table if not exists public.profesionales (
    id text primary key,
    nombre text not null,
    rol text not null, -- MED, ENF, TS, COORD
    rol_nombre text,
    cedula text,
    registro text,
    especialidad text,
    telefono text,
    email text,
    estado text default 'Activo',
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Habilitar RLS (Row Level Security) y politicas de lectura/escritura publica (anon)
alter table public.profesionales enable row level security;

create policy "Permitir lectura publica a profesionales"
on public.profesionales for select
using (true);

create policy "Permitir insercion y actualizacion publica a profesionales"
on public.profesionales for all
using (true)
with check (true);

-- 2. Tabla: Padron y Valoraciones Multidimensionales de Pacientes
create table if not exists public.pacientes (
    id text primary key,
    documento text,
    nombre text not null,
    edad integer,
    sexo text,
    criterio_primario text, -- IC, EPOC, CIRROSIS, ERC
    score_final integer,    -- 0 (Baja), 1 (Moderada), 2 (Alta)
    complejidad text,
    admite_programa boolean default false,
    datos_completos jsonb not null, -- Estructura clinica integra: VMD, escalas, PAI, red
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Habilitar RLS
alter table public.pacientes enable row level security;

create policy "Permitir lectura publica a pacientes"
on public.pacientes for select
using (true);

create policy "Permitir insercion y actualizacion publica a pacientes"
on public.pacientes for all
using (true)
with check (true);

-- 3. Tabla: Registro de Auditoria de Evaluaciones Interdisciplinarias
create table if not exists public.auditorias_vmd (
    id bigserial primary key,
    paciente_id text not null,
    profesional_id text,
    profesional_nombre text,
    rol text,
    dimension text, -- Clinica, Funcional, Cognitiva, Nutricional, Social
    accion text default 'VALORACION_GUARDADA',
    fecha timestamptz default now()
);

alter table public.auditorias_vmd enable row level security;

create policy "Permitir lectura y registro de auditoria"
on public.auditorias_vmd for all
using (true)
with check (true);

-- 4. Insercion de Miembros Iniciales del Equipo de Salud Optimus Health
insert into public.profesionales (id, nombre, rol, rol_nombre, cedula, registro, especialidad, telefono, email, estado)
values
  ('EQ-001', 'Dr. Carlos Restrepo Mendoza', 'MED', 'Médico Internista / Evaluador Senior', '71234567', 'RM-98432-COL', 'Medicina Interna y Cronicidad IOCC', '+57 310 456 7890', 'carlos.restrepo@optimushealth.co', 'Activo'),
  ('EQ-002', 'Dra. Valentina Gómez', 'MED', 'Médica General / Gestora de Casos', '1023456789', 'RM-112345-COL', 'Atención Primaria y Enlace Ambulatorio', '+57 311 234 5678', 'valentina.gomez@optimushealth.co', 'Activo'),
  ('EQ-003', 'Enf. Laura Restrepo', 'ENF', 'Enfermera de Práctica Avanzada (EPA)', '43567890', 'TE-54321-COL', 'Cuidados Continuos, Fragilidad y Adherencia', '+57 315 876 5432', 'laura.restrepo@optimushealth.co', 'Activo'),
  ('EQ-004', 'Lic. Diana Patricia Morales', 'TS', 'Trabajadora Social Sociosanitaria', '32456781', 'TS-33211-COL', 'Redes de Apoyo y Sobrecarga del Cuidador', '+57 318 654 3210', 'diana.morales@optimushealth.co', 'Activo'),
  ('EQ-005', 'Dr. Roberto Mejía', 'COORD', 'Coordinador Junta de Cronicidad New Care', '9876543', 'RM-44332-COL', 'Dirección Médica y Aseguramiento de Calidad', '+57 300 112 2334', 'roberto.mejia@optimushealth.co', 'Activo')
on conflict (id) do nothing;
