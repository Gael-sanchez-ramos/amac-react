import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import EtiquetaEstatus from '../components/EtiquetaEstatus'

export default function SolicitudesRecibidas() {
  const { sesion, perfil } = useAuth()
  const [solicitudes, setSolicitudes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [mensaje, setMensaje] = useState('')

  const cargarSolicitudes = useCallback(async () => {
    if (!sesion?.user?.id) return
    setCargando(true)

    // Empresa: solicitudes de sus vacantes (RF-022)
    const { data, error } = await supabase
      .from('solicitudes')
      .select(
        'id, estatus, creada_en, vacante:vacantes!inner(id, titulo, empresa_id), candidato:perfiles(nombre, edad, colonia, experiencia, telefono)'
      )
      .eq('vacante.empresa_id', sesion.user.id)
      .neq('estatus', 'Cancelada')
      .order('creada_en', { ascending: false })

    if (!error && data) {
      setSolicitudes(data)
    }
    setCargando(false)
  }, [sesion?.user?.id])

  useEffect(() => {
    cargarSolicitudes()
  }, [cargarSolicitudes])

  // Cambio de estatus (RF-024): En revisión / Aceptada / Rechazada
  async function actualizarEstatus(solicitudId, nuevoEstatus) {
    const { error } = await supabase
      .from('solicitudes')
      .update({ estatus: nuevoEstatus })
      .eq('id', solicitudId)

    if (!error) {
      setMensaje(`Estatus actualizado a "${nuevoEstatus}".`)
      cargarSolicitudes()
    }
  }

  return (
    <>
      <div className="cabecera-editorial">
        <p>{(perfil?.nombre || 'MI EMPRESA').toUpperCase()}</p>
        <h1>Solicitudes recibidas</h1>
        <p>
          Revisa la experiencia de las personas candidatas y actualiza el
          estatus de su postulación.
        </p>
      </div>

      <Link className="boton boton--ancho" to="/empresa/vacantes">
        Volver a mis vacantes
      </Link>

      {mensaje && (
        <p role="status" className="aviso-estado aviso-estado--exito">
          {mensaje}
        </p>
      )}

      <section className="pila" aria-label="Listado de candidatos postulados">
        {cargando && <p role="status">Cargando solicitudes recibidas...</p>}

        {!cargando && solicitudes.length === 0 && (
          <p className="aviso-estado">
            No hay solicitudes activas para tus vacantes en este momento.
          </p>
        )}

        {solicitudes.map((sol) => (
          <article key={sol.id} className="bloque-informacion">
            <h2>{sol.candidato?.nombre || 'Candidato AMAC'}</h2>
            <p>
              <strong>Vacante:</strong> {sol.vacante?.titulo}
            </p>
            <p>
              <strong>Edad:</strong> {sol.candidato?.edad ?? 'No registrada'} años
              · <strong>Colonia:</strong>{' '}
              {sol.candidato?.colonia || 'No registrada'}
              {sol.candidato?.telefono && (
                <>
                  {' '}
                  · <strong>Teléfono:</strong> {sol.candidato.telefono}
                </>
              )}
            </p>
            <p>
              <strong>Experiencia:</strong>{' '}
              {sol.candidato?.experiencia || 'Sin experiencia especificada'}
            </p>

            <EtiquetaEstatus estatus={sol.estatus} />

            <div className="acciones">
              <button
                type="button"
                className="boton"
                disabled={sol.estatus === 'En revisión'}
                onClick={() => actualizarEstatus(sol.id, 'En revisión')}
              >
                En revisión
              </button>
              <button
                type="button"
                className="boton boton--coral"
                disabled={sol.estatus === 'Aceptada'}
                onClick={() => actualizarEstatus(sol.id, 'Aceptada')}
              >
                Aceptada
              </button>
              <button
                type="button"
                className="boton"
                disabled={sol.estatus === 'Rechazada'}
                onClick={() => actualizarEstatus(sol.id, 'Rechazada')}
              >
                Rechazada
              </button>
            </div>
          </article>
        ))}
      </section>
    </>
  )
}
