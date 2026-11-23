import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

// Funcionalidad opcional puntos extra (Sección 3.2): Editar perfil (RF-014 / RF-017)
export default function Perfil() {
  const { perfil, recargarPerfil } = useAuth()

  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [edad, setEdad] = useState('')
  const [colonia, setColonia] = useState('')
  const [experiencia, setExperiencia] = useState('')
  const [giro, setGiro] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [esError, setEsError] = useState(false)
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    if (perfil) {
      setNombre(perfil.nombre || '')
      setTelefono(perfil.telefono || '')
      setEdad(perfil.edad ?? '')
      setColonia(perfil.colonia || '')
      setExperiencia(perfil.experiencia || '')
      setGiro(perfil.giro || '')
    }
  }, [perfil])

  async function manejarGuardar(e) {
    e.preventDefault()
    if (!perfil?.id) return

    setGuardando(true)
    setMensaje('')
    setEsError(false)

    const cambios =
      perfil.rol === 'empresa'
        ? {
            nombre: nombre.trim(),
            telefono: telefono.trim(),
            giro: giro.trim(),
          }
        : {
            nombre: nombre.trim(),
            telefono: telefono.trim(),
            edad: edad ? Number(edad) : null,
            colonia: colonia.trim(),
            experiencia: experiencia.trim(),
          }

    const { error } = await supabase
      .from('perfiles')
      .update(cambios)
      .eq('id', perfil.id)

    setGuardando(false)

    if (error) {
      setEsError(true)
      setMensaje(`No se pudieron guardar los cambios: ${error.message}`)
      return
    }

    setMensaje('¡Tus datos de perfil se actualizaron correctamente!')
    recargarPerfil()
  }

  const esEmpresa = perfil?.rol === 'empresa'

  return (
    <>
      <div className="cabecera-editorial cabecera-editorial--centrada">
        <p>MI CUENTA</p>
        <h1>Mi perfil</h1>
        <p>
          {esEmpresa
            ? 'Actualiza los datos de contacto y giro de tu empresa (RF-017).'
            : 'Mantén al día tus datos de contacto, colonia y experiencia laboral (RF-014).'}
        </p>
      </div>

      <form
        className="formulario-registro"
        onSubmit={manejarGuardar}
        aria-label="Edición del perfil"
      >
        {mensaje && (
          <p
            role={esError ? 'alert' : 'status'}
            className={`aviso-estado ${
              esError ? 'aviso-estado--error' : 'aviso-estado--exito'
            }`}
          >
            {mensaje}
          </p>
        )}

        <fieldset>
          <legend>
            {esEmpresa ? 'Información de la empresa' : 'Datos personales'}
          </legend>
          <div className="campos">
            <div className="campo-formulario">
              <label htmlFor="nombre-perfil">
                {esEmpresa ? 'Nombre de la empresa' : 'Nombre completo'}
              </label>
              <input
                type="text"
                id="nombre-perfil"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </div>

            <div className="campo-formulario">
              <label htmlFor="telefono-perfil">Teléfono de contacto</label>
              <input
                type="tel"
                id="telefono-perfil"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                required
              />
            </div>

            {esEmpresa ? (
              <div className="campo-formulario campo-completo">
                <label htmlFor="giro-perfil">Giro de la empresa</label>
                <input
                  type="text"
                  id="giro-perfil"
                  value={giro}
                  onChange={(e) => setGiro(e.target.value)}
                  required
                />
              </div>
            ) : (
              <>
                <div className="campo-formulario">
                  <label htmlFor="edad-perfil">Edad</label>
                  <input
                    type="number"
                    id="edad-perfil"
                    min="18"
                    max="120"
                    value={edad}
                    onChange={(e) => setEdad(e.target.value)}
                    required
                  />
                </div>

                <div className="campo-formulario">
                  <label htmlFor="colonia-perfil">Colonia</label>
                  <input
                    type="text"
                    id="colonia-perfil"
                    value={colonia}
                    onChange={(e) => setColonia(e.target.value)}
                    required
                  />
                </div>
              </>
            )}
          </div>
        </fieldset>

        {!esEmpresa && (
          <fieldset>
            <legend>Experiencia y habilidades</legend>
            <div className="pila">
              <div className="campo-formulario">
                <label htmlFor="experiencia-perfil">Experiencia laboral</label>
                <textarea
                  id="experiencia-perfil"
                  value={experiencia}
                  onChange={(e) => setExperiencia(e.target.value)}
                  required
                />
              </div>
            </div>
          </fieldset>
        )}

        <button
          className="boton boton--coral boton--ancho"
          type="submit"
          disabled={guardando}
        >
          {guardando ? 'Guardando cambios...' : 'Guardar cambios'}
        </button>

        <Link
          className="boton boton--ancho"
          to={esEmpresa ? '/empresa/vacantes' : '/mis-solicitudes'}
        >
          {esEmpresa ? 'Volver a mi empresa' : 'Volver a mis solicitudes'}
        </Link>
      </form>
    </>
  )
}
