export default function EtiquetaEstatus({ estatus }) {
  const mapaClases = {
    Enviada: 'etiqueta-estatus etiqueta-estatus--pendiente',
    'En revisión': 'etiqueta-estatus etiqueta-estatus--pendiente',
    Pendiente: 'etiqueta-estatus etiqueta-estatus--pendiente',
    Aceptada: 'etiqueta-estatus etiqueta-estatus--aceptada',
    Rechazada: 'etiqueta-estatus etiqueta-estatus--rechazada',
    Cancelada: 'etiqueta-estatus etiqueta-estatus--rechazada',
    activa: 'etiqueta-estatus etiqueta-estatus--aceptada',
    pausada: 'etiqueta-estatus etiqueta-estatus--pendiente',
    cerrada: 'etiqueta-estatus etiqueta-estatus--rechazada',
  }

  const mapaTexto = {
    activa: '● Activa',
    pausada: '⏸ Pausada',
    cerrada: '✕ Cerrada',
  }

  const clase = mapaClases[estatus] || 'etiqueta-estatus'
  const texto = mapaTexto[estatus] || estatus

  return <span className={clase}>{texto}</span>
}
