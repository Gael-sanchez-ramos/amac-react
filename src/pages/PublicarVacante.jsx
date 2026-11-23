import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function PublicarVacante() {
  const { sesion } = useAuth()
  const navigate = useNavigate()

  const [titulo, setTitulo] = useState('')
  const [sueldo, setSueldo] = useState('')
  const [ubicacion, setUbicacion] = useState('')
  const [horario, setHorario] = useState('Matutino')
  const [categoria, setCategoria] = useState('Atención al cliente')
  const [descripcion, setDescripcion] = useState('')
  const [requisitos, setRequisitos] = useState('')
  const [prestaciones, setPrestaciones] = useState('')
  const [recibirPorTelefono, setRecibirPorTelefono] = useState(false)
  const [telefonoContacto, setTelefonoContacto] = useState('')

  const [mensaje, setMensaje] = useState('')
  const [cargando, setCargando] = useState(false)

  // Publicar vacante (RF-019): todos los campos obligatorios validados;
  // teléfono solo si elige postulaciones por teléfono
  async function manejarPublicar(e) {
    e.preventDefault()
    setMensaje('')

    const sueldoNum = Number(sueldo)
    if (!sueldoNum || sueldoNum <= 0) {
      setMensaje('El sueldo mensual debe ser mayor a 0.')
      return
    }

    if (recibirPorTelefono && !telefonoContacto.trim()) {
      setMensaje(
        'Ingresa el teléfono de contacto o desmarca la opción de recibir llamadas.'
      )
      return
    }

    setCargando(true)

    const { error } = await supabase.from('vacantes').insert({
      empresa_id: sesion.user.id,
      titulo: titulo.trim(),
      sueldo: sueldoNum,
      ubicacion: ubicacion.trim(),
      horario,
      categoria,
      descripcion: descripcion.trim(),
      requisitos: requisitos.trim(),
      prestaciones: prestaciones.trim(),
      telefono_contacto: recibirPorTelefono ? telefonoContacto.trim() : null,
      estado: 'activa',
    })

    setCargando(false)

    if (error) {
      setMensaje(`Error al publicar la vacante: ${error.message}`)
      return
    }

    navigate('/empresa/vacantes')
  }

  return (
    <>
      <div className="cabecera-editorial cabecera-editorial--centrada">
        <p>MI EMPRESA</p>
        <h1>Publicar nueva vacante</h1>
        <p>
          Describe el puesto con claridad para atraer a candidatos con
          experiencia.
        </p>
      </div>

      <form
        className="formulario-registro"
        onSubmit={manejarPublicar}
        aria-label="Publicar vacante"
      >
        <p>Todos los campos son obligatorios.</p>

        {mensaje && (
          <p role="alert" className="aviso-estado aviso-estado--error">
            {mensaje}
          </p>
        )}

        <fieldset>
          <legend>Información general del puesto</legend>
          <div className="campos">
            <div className="campo-formulario">
              <label htmlFor="titulo">Título de la vacante</label>
              <input
                type="text"
                id="titulo"
                placeholder="Ej. Auxiliar de atención"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                required
              />
            </div>

            <div className="campo-formulario">
              <label htmlFor="sueldo">Sueldo mensual (MXN)</label>
              <input
                type="number"
                id="sueldo"
                min="1"
                step="100"
                placeholder="Ej. 8500"
                value={sueldo}
                onChange={(e) => setSueldo(e.target.value)}
                required
              />
            </div>

            <div className="campo-formulario">
              <label htmlFor="ubicacion">Ubicación</label>
              <input
                type="text"
                id="ubicacion"
                placeholder="Ej. Centro, Monterrey, N.L."
                value={ubicacion}
                onChange={(e) => setUbicacion(e.target.value)}
                required
              />
            </div>

            <div className="campo-formulario">
              <label htmlFor="horario">Horario</label>
              <select
                id="horario"
                value={horario}
                onChange={(e) => setHorario(e.target.value)}
                required
              >
                <option value="Matutino">Matutino</option>
                <option value="Vespertino">Vespertino</option>
                <option value="Medio tiempo">Medio tiempo</option>
                <option value="Fines de semana">Fines de semana</option>
              </select>
            </div>

            <div className="campo-formulario campo-completo">
              <label htmlFor="categoria">Categoría</label>
              <select
                id="categoria"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                required
              >
                <option value="Atención al cliente">Atención al cliente</option>
                <option value="Ventas">Ventas</option>
                <option value="Administración">Administración</option>
                <option value="Mantenimiento">Mantenimiento</option>
              </select>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>Detalles y requisitos</legend>
          <div className="pila">
            <div className="campo-formulario">
              <label htmlFor="descripcion">
                Descripción de actividades (¿Qué hará la persona?)
              </label>
              <textarea
                id="descripcion"
                placeholder="Describe las actividades principales del puesto..."
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                required
              />
            </div>

            <div className="campo-formulario">
              <label htmlFor="requisitos">Requisitos</label>
              <textarea
                id="requisitos"
                placeholder="Ej. Trato amable, experiencia en atención a clientes..."
                value={requisitos}
                onChange={(e) => setRequisitos(e.target.value)}
                required
              />
            </div>

            <div className="campo-formulario">
              <label htmlFor="prestaciones">Prestaciones y beneficios</label>
              <textarea
                id="prestaciones"
                placeholder="Ej. Prestaciones de ley, capacitación inicial..."
                value={prestaciones}
                onChange={(e) => setPrestaciones(e.target.value)}
                required
              />
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>Contacto telefónico (opcional — RF-019)</legend>
          <div className="pila">
            <div className="aceptacion">
              <div className="opcion-aceptacion">
                <input
                  type="checkbox"
                  id="recibir-telefono"
                  checked={recibirPorTelefono}
                  onChange={(e) => setRecibirPorTelefono(e.target.checked)}
                />
                <label htmlFor="recibir-telefono">
                  Deseo recibir también postulaciones por llamada telefónica
                </label>
              </div>
            </div>

            {recibirPorTelefono && (
              <div className="campo-formulario">
                <label htmlFor="telefono-contacto">
                  Teléfono para recibir llamadas de candidatos
                </label>
                <input
                  type="tel"
                  id="telefono-contacto"
                  placeholder="Ej. +528100000001"
                  value={telefonoContacto}
                  onChange={(e) => setTelefonoContacto(e.target.value)}
                  required={recibirPorTelefono}
                />
              </div>
            )}
          </div>
        </fieldset>

        <button
          className="boton boton--coral boton--ancho"
          type="submit"
          disabled={cargando}
        >
          {cargando ? 'Publicando vacante...' : 'Publicar vacante'}
        </button>

        <Link className="boton boton--ancho" to="/empresa/vacantes">
          Volver a mis vacantes
        </Link>
      </form>
    </>
  )
}
