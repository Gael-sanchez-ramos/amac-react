import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import EtiquetaEstatus from '../components/EtiquetaEstatus'

export default function EmpresaVacantes() {
  const { sesion, perfil } = useAuth()
  const [vacantes, setVacantes] = useState([])
  const [solicitudes, setSolicitudes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [mensaje, setMensaje] = useState('')

  const cargarDatosEmpresa = useCallback(async () => {
    if (!sesion?.user?.id) return
    setCargando(true)

    // 1) Cargar vacantes de la empresa (RF-020)
    const { data: vacantesData } = await supabase
      .from('vacantes')
      .select('*, solicitudes(id, estatus)')
      .eq('empresa_id', sesion.user.id)
      .order('creada_en', { ascending: false })

    if (vacantesData) {
      setVacantes(vacantesData)
    }

    // 2) Cargar solicitudes recibidas en sus vacantes (RF-022)
    const { data: solicitudesData } = await supabase
      .from('solicitudes')
      .select(
        'id, estatus, creada_en, vacante_id, vacante:vacantes!inner(id, titulo, empresa_id), candidato:perfiles(id, nombre, edad, colonia, experiencia, telefono)'
      )
      .eq('vacante.empresa_id', sesion.user.id)
      .neq('estatus', 'Cancelada')
      .order('creada_en', { ascending: false })

    if (solicitudesData) {
      setSolicitudes(solicitudesData)
    }

    setCargando(false)
  }, [sesion?.user?.id])

  useEffect(() => {
    cargarDatosEmpresa()
  }, [cargarDatosEmpresa])

  // Pausar, reactivar o cerrar vacante (RF-021)
  async function cambiarEstadoVacante(vacanteId, nuevoEstado) {
    const { error } = await supabase
      .from('vacantes')
      .update({ estado: nuevoEstado })
      .eq('id', vacanteId)

    if (!error) {
      setMensaje(`Estado de la vacante actualizado a "${nuevoEstado}".`)
      cargarDatosEmpresa()
    }
  }

  // Cambiar estatus de solicitud recibida (RF-024)
  async function cambiarEstatusSolicitud(solicitudId, nuevoEstatus) {
    const { error } = await supabase
      .from('solicitudes')
      .update({ estatus: nuevoEstatus })
      .eq('id', solicitudId)

    if (!error) {
      setMensaje(`Estatus de la solicitud cambiado a "${nuevoEstatus}".`)
      cargarDatosEmpresa()
    }
  }

  return (
    <>
      <div className="cabecera-editorial">
        <p>{(perfil?.nombre || 'MI EMPRESA').toUpperCase()}</p>
        <h1>Tus vacantes</h1>
        <p>Administra tus oportunidades y conoce a quienes se postulan.</p>
      </div>

      <div className="selector-rol" style={{ justifyContent: 'flex-start' }}>
        <span className="etiqueta-estatus etiqueta-estatus--aprobada">
          ✓ Empresa registrada
        </span>
        <Link className="boton boton--coral" to="/empresa/publicar">
          Publicar vacante
        </Link>
        <Link className="boton" to="/empresa/solicitudes">
          Ver solicitudes recibidas ({solicitudes.length})
        </Link>
      </div>

      {mensaje && (
        <p role="status" className="aviso-estado aviso-estado--exito">
          {mensaje}
        </p>
      )}

      <section className="pila" aria-label="Vacantes de tu empresa">
        {cargando && <p role="status">Cargando tus vacantes...</p>}

        {!cargando && vacantes.length === 0 && (
          <article className="tarjeta-empresa">
            <h2>Aún no has publicado vacantes</h2>
            <p>
              Publica tu primera vacante para que las personas candidatas de
              AMAC puedan postularse.
            </p>
            <Link className="boton boton--coral" to="/empresa/publicar">
              Publicar vacante ahora
            </Link>
          </article>
        )}

        {vacantes.map((v) => {
          const solicitudesActivas = (v.solicitudes || []).filter(
            (s) => s.estatus !== 'Cancelada'
          ).length
          const fecha = v.creada_en
            ? new Date(v.creada_en).toLocaleDateString('es-MX', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })
            : ''

          return (
            <article
              key={v.id}
              className="tarjeta-empresa"
              aria-labelledby={`vacante-empresa-${v.id}`}
            >
              <h2 id={`vacante-empresa-${v.id}`}>{v.titulo}</h2>
              <p>
                {v.categoria} · {v.horario} · $
                {Number(v.sueldo).toLocaleString('es-MX')} MXN
                <br />
                {fecha && (
                  <>
                    Publicada: <time dateTime={v.creada_en}>{fecha}</time>
                    <br />
                  </>
                )}
                <strong>
                  {solicitudesActivas}{' '}
                  {solicitudesActivas === 1
                    ? 'solicitud recibida'
                    : 'solicitudes recibidas'}
                </strong>
              </p>

              <EtiquetaEstatus estatus={v.estado} />

              <a
                className="boton boton--coral boton--ancho"
                href="#solicitudes-recibidas"
              >
                Ver solicitudes
              </a>

              <div className="acciones">
                <Link className="boton" to={`/vacantes/${v.id}`}>
                  Ver detalle
                </Link>
                <button
                  className="boton"
                  type="button"
                  disabled={v.estado !== 'activa'}
                  onClick={() => cambiarEstadoVacante(v.id, 'pausada')}
                >
                  Pausar vacante
                </button>
                <button
                  className="boton"
                  type="button"
                  disabled={v.estado === 'activa'}
                  onClick={() => cambiarEstadoVacante(v.id, 'activa')}
                >
                  Reactivar vacante
                </button>
                <button
                  className="boton"
                  type="button"
                  disabled={v.estado === 'cerrada'}
                  onClick={() => cambiarEstadoVacante(v.id, 'cerrada')}
                >
                  Cerrar vacante
                </button>
              </div>
            </article>
          )
        })}
      </section>

      <section
        className="pila"
        id="solicitudes-recibidas"
        aria-labelledby="titulo-recibidas"
      >
        <h2 id="titulo-recibidas">Solicitudes recibidas</h2>
        <p>
          Candidatos postulados a las vacantes de {perfil?.nombre || 'tu empresa'}
        </p>

        {!cargando && solicitudes.length === 0 && (
          <p className="aviso-estado">
            Aún no hay solicitudes recibidas en tus vacantes.
          </p>
        )}

        {solicitudes.map((sol) => (
          <article key={sol.id} className="bloque-informacion">
            <h3>{sol.candidato?.nombre || 'Candidato AMAC'}</h3>
            <p>
              <strong>Vacante:</strong> {sol.vacante?.titulo}
            </p>
            <p>
              <strong>Edad:</strong> {sol.candidato?.edad ?? 'No especificada'}{' '}
              años · <strong>Colonia:</strong>{' '}
              {sol.candidato?.colonia || 'No especificada'}
              {sol.candidato?.telefono && (
                <>
                  {' '}
                  · <strong>Teléfono:</strong> {sol.candidato.telefono}
                </>
              )}
            </p>
            <p>
              <strong>Experiencia:</strong>{' '}
              {sol.candidato?.experiencia || 'Sin detalle registrado'}
            </p>

            <EtiquetaEstatus estatus={sol.estatus} />

            <div className="acciones">
              <button
                type="button"
                className="boton"
                disabled={sol.estatus === 'En revisión'}
                onClick={() => cambiarEstatusSolicitud(sol.id, 'En revisión')}
              >
                Marcar En revisión
              </button>
              <button
                type="button"
                className="boton boton--coral"
                disabled={sol.estatus === 'Aceptada'}
                onClick={() => cambiarEstatusSolicitud(sol.id, 'Aceptada')}
              >
                Aceptar solicitud
              </button>
              <button
                type="button"
                className="boton"
                disabled={sol.estatus === 'Rechazada'}
                onClick={() => cambiarEstatusSolicitud(sol.id, 'Rechazada')}
              >
                Rechazar solicitud
              </button>
            </div>
          </article>
        ))}
      </section>
    </>
  )
}
