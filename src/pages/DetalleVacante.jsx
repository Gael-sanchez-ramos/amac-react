import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { supabase, supabaseConfigurado } from '../lib/supabase'
import { VACANTES_DEMO } from '../lib/datosDemo'
import { useAuth } from '../context/AuthContext'

export default function DetalleVacante() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { sesion, perfil } = useAuth()

  const [vacante, setVacante] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [tipoMensaje, setTipoMensaje] = useState('') // 'exito' | 'error' | 'pendiente'

  useEffect(() => {
    async function cargarVacante() {
      setCargando(true)
      if (!supabaseConfigurado) {
        const encontrada =
          VACANTES_DEMO.find((v) => String(v.id) === String(id)) ||
          VACANTES_DEMO[0]
        setVacante(encontrada)
        setCargando(false)
        return
      }

      const { data, error } = await supabase
        .from('vacantes')
        .select('*, empresa:perfiles(nombre, giro)')
        .eq('id', id)
        .single()

      if (!error && data) {
        setVacante(data)
      } else {
        setVacante(null)
      }
      setCargando(false)
    }

    cargarVacante()
  }, [id])

  // Postularme (RF-004, RF-054)
  async function manejarPostulacion() {
    if (!sesion) {
      navigate('/login')
      return
    }

    if (perfil?.rol === 'empresa') {
      setTipoMensaje('error')
      setMensaje('Las cuentas de empresa no pueden postularse a vacantes.')
      return
    }

    if (!perfil?.aprobado) {
      setTipoMensaje('pendiente')
      setMensaje(
        'Tu registro aún no ha sido aprobado por AMAC. Por favor espera.'
      )
      return
    }

    setEnviando(true)
    setMensaje('')

    const { error } = await supabase
      .from('solicitudes')
      .insert({ vacante_id: vacante.id, candidato_id: sesion.user.id })

    if (error?.code === '23505') {
      setTipoMensaje('error')
      setMensaje('Ya te postulaste a esta vacante.') // unique (vacante_id, candidato_id)
    } else if (error) {
      setTipoMensaje('pendiente')
      setMensaje(
        'Tu registro aún no ha sido aprobado por AMAC. Por favor espera.'
      )
    } else {
      setTipoMensaje('exito')
      setMensaje('¡Listo! Tu solicitud fue enviada.')
    }

    setEnviando(false)
  }

  if (cargando) {
    return <p role="status">Cargando detalle de la vacante...</p>
  }

  if (!vacante) {
    return (
      <div className="pila">
        <p role="alert" className="aviso-estado aviso-estado--error">
          No encontramos la vacante solicitada o ya no está activa.
        </p>
        <Link className="boton boton--ancho" to="/">
          Volver a vacantes
        </Link>
      </div>
    )
  }

  const sueldoFormateado = Number(vacante.sueldo || 0).toLocaleString('es-MX')
  const nombreEmpresa = vacante.empresa?.nombre || 'Empresa AMAC'

  return (
    <>
      <div className="cabecera-editorial">
        <p>{(vacante.categoria || 'VACANTE').toUpperCase()}</p>
        <h1>{vacante.titulo}</h1>
        <p>
          {nombreEmpresa} · {vacante.ubicacion}
        </p>
      </div>

      <Link className="boton boton--ancho" to="/">
        Volver a vacantes
      </Link>

      <div className="oferta-postulacion">
        <div className="informacion-vacante">
          <section className="bloque-informacion" aria-labelledby="sueldo">
            <h2 id="sueldo">${sueldoFormateado} MXN al mes</h2>
            <p>
              Horario: {vacante.horario}
              <br />
              Ubicación: {vacante.ubicacion}
            </p>
          </section>

          <section className="bloque-informacion" aria-labelledby="actividades">
            <h2 id="actividades">¿Qué harás?</h2>
            <p>{vacante.descripcion}</p>
          </section>

          <section className="bloque-informacion" aria-labelledby="requisitos">
            <h2 id="requisitos">Lo que necesitas</h2>
            <p>{vacante.requisitos}</p>
          </section>

          <section className="bloque-informacion" aria-labelledby="beneficios">
            <h2 id="beneficios">Lo que ofrecemos</h2>
            <p>{vacante.prestaciones}</p>
          </section>

          <section className="bloque-informacion" aria-labelledby="proceso">
            <h2 id="proceso">Proceso de selección</h2>
            <ol>
              <li>Revisamos tu solicitud.</li>
              <li>Te contactamos por el medio que elijas.</li>
              <li>Realizamos una entrevista presencial.</li>
            </ol>
          </section>
        </div>

        <aside
          className="siguiente-paso pila"
          aria-labelledby="siguiente-paso"
        >
          <h2 id="siguiente-paso">Da el siguiente paso</h2>

          <p>Para postularte necesitas una cuenta aprobada por AMAC.</p>

          {mensaje && (
            <p
              role="status"
              className={`aviso-estado ${
                tipoMensaje === 'exito'
                  ? 'aviso-estado--exito'
                  : tipoMensaje === 'error'
                  ? 'aviso-estado--error'
                  : 'aviso-estado--pendiente'
              }`}
            >
              {mensaje}
            </p>
          )}

          {!sesion ? (
            <Link className="boton boton--azul boton--ancho" to="/login">
              Iniciar sesión para postularme
            </Link>
          ) : (
            <button
              type="button"
              className="boton boton--azul boton--ancho"
              onClick={manejarPostulacion}
              disabled={enviando}
            >
              {enviando ? 'Enviando solicitud...' : 'Postularme'}
            </button>
          )}

          {tipoMensaje === 'exito' && (
            <Link
              className="boton boton--coral boton--ancho"
              to="/mis-solicitudes"
            >
              Ver mis solicitudes
            </Link>
          )}

          {/* RF-051: Botón Llamar solo si la vacante tiene teléfono */}
          {vacante.telefono_contacto && (
            <>
              <p>
                Esta empresa también recibe postulaciones por teléfono:{' '}
                <strong>{vacante.telefono_contacto}</strong>
              </p>
              <a
                className="boton boton--ancho"
                href={`tel:${vacante.telefono_contacto.replace(/\s+/g, '')}`}
              >
                Llamar
                <span className="solo-lectores"> a {nombreEmpresa}</span>
              </a>
            </>
          )}
        </aside>
      </div>
    </>
  )
}
