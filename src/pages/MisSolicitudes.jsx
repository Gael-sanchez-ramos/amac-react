import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import EtiquetaEstatus from '../components/EtiquetaEstatus'

export default function MisSolicitudes() {
  const { sesion, perfil } = useAuth()
  const [solicitudes, setSolicitudes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [mensaje, setMensaje] = useState('')

  const cargarSolicitudes = useCallback(async () => {
    if (!sesion?.user?.id) return
    setCargando(true)
    const { data, error } = await supabase
      .from('solicitudes')
      .select(
        'id, estatus, creada_en, vacante_id, vacante:vacantes(id, titulo, ubicacion, empresa:perfiles(nombre))'
      )
      .eq('candidato_id', sesion.user.id)
      .order('creada_en', { ascending: false })

    if (!error && data) {
      setSolicitudes(data)
    }
    setCargando(false)
  }, [sesion?.user?.id])

  useEffect(() => {
    cargarSolicitudes()
  }, [cargarSolicitudes])

  // Cancelar solicitud (RF-006): pedir confirmación antes y no cancelar Aceptada/Rechazada
  async function manejarCancelar(solicitud) {
    if (
      solicitud.estatus === 'Aceptada' ||
      solicitud.estatus === 'Rechazada' ||
      solicitud.estatus === 'Cancelada'
    ) {
      return
    }

    const confirmado = window.confirm(
      '¿Seguro que quieres cancelar esta solicitud?'
    )
    if (!confirmado) return

    const { error } = await supabase
      .from('solicitudes')
      .update({ estatus: 'Cancelada' })
      .eq('id', solicitud.id)

    if (!error) {
      setMensaje('Tu solicitud ha sido cancelada.')
      cargarSolicitudes()
    } else {
      setMensaje('No fue posible cancelar la solicitud.')
    }
  }

  return (
    <>
      <div className="cabecera-editorial">
        <p>MI CUENTA · {perfil?.nombre?.toUpperCase() || 'CANDIDATO'}</p>
        <h1>Mis solicitudes</h1>
        <p>Consulta cómo avanza cada oportunidad laboral.</p>
      </div>

      <div>
        {perfil?.aprobado ? (
          <span className="etiqueta-estatus etiqueta-estatus--aprobada">
            ✓ Candidato aprobado por AMAC
          </span>
        ) : (
          <span className="etiqueta-estatus etiqueta-estatus--pendiente">
            ⏳ Perfil pendiente de aprobación por AMAC
          </span>
        )}
      </div>

      <section className="perfil" aria-labelledby="titulo-perfil">
        <div className="pila-compacta">
          <h2 id="titulo-perfil">Tu perfil profesional</h2>
          <p>
            Mantén al día tus datos de contacto ({perfil?.telefono || 'Sin teléfono'}),
            colonia ({perfil?.colonia || 'Sin colonia'}) y experiencia.
          </p>
        </div>
        <Link className="boton boton--coral" to="/perfil">
          Editar mi perfil
        </Link>
      </section>

      {mensaje && (
        <p role="status" className="aviso-estado">
          {mensaje}
        </p>
      )}

      <section className="lista-solicitudes" aria-label="Solicitudes enviadas">
        {cargando && <p role="status">Cargando tus solicitudes...</p>}

        {!cargando && solicitudes.length === 0 && (
          <article className="tarjeta-solicitud">
            <h2>Aún no tienes solicitudes enviadas</h2>
            <p>
              Explora las vacantes disponibles y postúlate a la que más te
              interese.
            </p>
            <Link className="boton boton--coral" to="/">
              Explorar vacantes
            </Link>
          </article>
        )}

        {solicitudes.map((solicitud) => {
          const tituloVacante =
            solicitud.vacante?.titulo || 'Vacante registrada'
          const nombreEmpresa =
            solicitud.vacante?.empresa?.nombre || 'Empresa AMAC'
          const fecha = solicitud.creada_en
            ? new Date(solicitud.creada_en).toLocaleDateString('es-MX', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })
            : ''
          const puedeCancelar =
            solicitud.estatus === 'Enviada' ||
            solicitud.estatus === 'En revisión'

          return (
            <article
              key={solicitud.id}
              className="tarjeta-solicitud"
              aria-labelledby={`solicitud-${solicitud.id}`}
            >
              <h2 id={`solicitud-${solicitud.id}`}>{tituloVacante}</h2>
              <p>
                <strong>{nombreEmpresa}</strong>
                {fecha && (
                  <>
                    <br />
                    Enviada el{' '}
                    <time dateTime={solicitud.creada_en}>{fecha}</time>
                  </>
                )}
              </p>

              <EtiquetaEstatus estatus={solicitud.estatus} />

              <p>
                {solicitud.estatus === 'Aceptada' &&
                  '¡Felicidades! La empresa se pondrá en contacto contigo para coordinar una entrevista.'}
                {solicitud.estatus === 'Rechazada' &&
                  'La empresa ha cerrado este proceso. Puedes seguir explorando otras oportunidades.'}
                {solicitud.estatus === 'Cancelada' &&
                  'Cancelaste esta postulación.'}
                {(solicitud.estatus === 'Enviada' ||
                  solicitud.estatus === 'En revisión') &&
                  'La empresa está revisando tu perfil. Aún no hay una decisión definitiva.'}
              </p>

              <Link
                className="boton boton--coral boton--ancho"
                to={`/vacantes/${solicitud.vacante_id}`}
              >
                Ver vacante
              </Link>

              <button
                className="boton boton--ancho"
                type="button"
                disabled={!puedeCancelar}
                onClick={() => manejarCancelar(solicitud)}
                aria-describedby={
                  !puedeCancelar ? `sin-cancelar-${solicitud.id}` : undefined
                }
              >
                Cancelar solicitud
                <span className="solo-lectores"> de {tituloVacante}</span>
              </button>

              {!puedeCancelar && (
                <p id={`sin-cancelar-${solicitud.id}`}>
                  Esta solicitud ya fue resuelta o cancelada, por eso no se
                  puede cancelar.
                </p>
              )}
            </article>
          )
        })}
      </section>
    </>
  )
}
