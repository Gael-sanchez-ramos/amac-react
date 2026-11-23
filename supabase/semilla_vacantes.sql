-- =========================================================
-- SEMILLA DE 6 VACANTES DE EJEMPLO (Entregable #2)
-- Instrucciones:
-- 1. Primero registra al menos una cuenta con rol "empresa" desde la app.
-- 2. Luego ejecuta este script en el SQL Editor de Supabase para cargar
--    automáticamente las 6 vacantes de ejemplo asociadas a esa empresa.
-- =========================================================

do $$
declare
  v_empresa_id uuid;
begin
  select id into v_empresa_id
  from public.perfiles
  where rol = 'empresa'
  order by creado_en asc
  limit 1;

  if v_empresa_id is null then
    raise exception 'Primero registra una cuenta de empresa en la aplicación antes de correr esta semilla.';
  end if;

  insert into public.vacantes (
    empresa_id, titulo, sueldo, ubicacion, horario, categoria,
    descripcion, requisitos, prestaciones, telefono_contacto, estado
  ) values
  (
    v_empresa_id,
    'Auxiliar de atención',
    8500.00,
    'Monterrey, N.L.',
    'Matutino',
    'Atención al cliente',
    'Recibirás a nuestros clientes, orientarás sus compras y apoyarás en el orden del área de atención.',
    'Trato amable y disposición para orientar a clientes. Experiencia en atención a personas. Disponibilidad para trabajar en horario matutino.',
    'Prestaciones de ley, capacitación inicial y un equipo que valora tu experiencia.',
    '+528100000001',
    'activa'
  ),
  (
    v_empresa_id,
    'Recepcionista',
    9200.00,
    'Monterrey, N.L.',
    'Matutino',
    'Atención al cliente',
    'Recibirás a las personas visitantes, atenderás llamadas y apoyarás con la agenda del centro.',
    'Comunicación clara y trato cordial. Organización para atender llamadas y registrar citas. Conocimientos básicos de computadora.',
    'Prestaciones de ley, capacitación inicial y un equipo que valora tu experiencia.',
    null,
    'activa'
  ),
  (
    v_empresa_id,
    'Auxiliar de biblioteca',
    8000.00,
    'Monterrey, N.L.',
    'Matutino',
    'Atención al cliente',
    'Orientarás a las personas lectoras y apoyarás con el préstamo y acomodo de libros.',
    'Interés por la lectura y la atención a personas. Organización para clasificar y acomodar libros.',
    'Prestaciones de ley, capacitación inicial y un equipo que valora tu experiencia.',
    null,
    'activa'
  ),
  (
    v_empresa_id,
    'Asesor de ventas',
    9000.00,
    'Monterrey, N.L.',
    'Vespertino',
    'Ventas',
    'Ayudarás a nuestros clientes a elegir productos y compartirás información sobre sus características.',
    'Trato amable y disposición para aprender. Experiencia en atención a personas. Secundaria terminada.',
    'Prestaciones de ley, capacitación inicial y un equipo que valora tu experiencia.',
    '+528100000004',
    'activa'
  ),
  (
    v_empresa_id,
    'Auxiliar administrativo',
    10000.00,
    'Monterrey, N.L.',
    'Matutino',
    'Administración',
    'Apoyarás en la organización de documentos, archivo y captura de información.',
    'Organización para manejar documentos y archivos. Conocimientos básicos de computadora y captura de datos.',
    'Prestaciones de ley, capacitación inicial y un equipo que valora tu experiencia.',
    null,
    'activa'
  ),
  (
    v_empresa_id,
    'Auxiliar de jardinería',
    8200.00,
    'Monterrey, N.L.',
    'Medio tiempo',
    'Mantenimiento',
    'Cuidarás las plantas y apoyarás en el mantenimiento de los espacios verdes de la comunidad.',
    'Interés o experiencia en el cuidado de plantas. Conocimiento básico de riego y mantenimiento de jardines.',
    'Prestaciones de ley, capacitación inicial y un equipo que valora tu experiencia.',
    null,
    'activa'
  );
end;
$$;
