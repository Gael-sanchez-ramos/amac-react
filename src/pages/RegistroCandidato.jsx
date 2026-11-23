import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function RegistroCandidato({ rolInicial = 'candidato' }) {
  const [tipoRol, setTipoRol] = useState(rolInicial) // 'candidato' | 'empresa'

  useEffect(() => {
    setTipoRol(rolInicial)
  }, [rolInicial])
  const [nombre, setNombre] = useState('')
  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [telefono, setTelefono] = useState('')
  const [edad, setEdad] = useState('')
  const [colonia, setColonia] = useState('')
  const [experiencia, setExperiencia] = useState('')
  const [giro, setGiro] = useState('')
  const [aceptaTerminos, setAceptaTerminos] = useState(false)

  const [mensaje, setMensaje] = useState('')
  const [esError, setEsError] = useState(false)
  const [cargando, setCargando] = useState(false)

  const navigate = useNavigate()

  // Registro de candidato (RF-011, RF-012, RF-013) y empresa (RF-015)
  async function manejarRegistro(e) {
    e.preventDefault()
    setMensaje('')
    setEsError(false)

    if (!aceptaTerminos) {
      setEsError(true)
      setMensaje('Debes aceptar los términos y condiciones para registrarte.')
      return
    }

    if (tipoRol === 'candidato') {
      const edadNum = Number(edad)
      if (!edadNum || edadNum < 18 || edadNum > 120) {
        setEsError(true)
        setMensaje('La edad debe estar entre 18 y 120 años.')
        return
      }
    }

    setCargando(true)

    const datosExtra =
      tipoRol === 'empresa'
        ? {
            rol: 'empresa',
            nombre: nombre.trim(),
            giro: giro.trim(),
            telefono: telefono.trim(),
          }
        : {
            rol: 'candidato',
            nombre: nombre.trim(),
            telefono: telefono.trim(),
            edad: String(edad).trim(),
            colonia: colonia.trim(),
            experiencia: experiencia.trim(),
          }

    const { data, error } = await supabase.auth.signUp({
      email: correo.trim(),
      password: contrasena,
      options: {
        data: datosExtra,
      },
    })

    if (error) {
      setEsError(true)
      setMensaje(
        error.message === 'User already registered'
          ? 'Este correo ya está registrado. Intenta iniciar sesión.'
          : `No se pudo completar el registro: ${error.message}`
      )
      setCargando(false)
      return
    }

    setCargando(false)
    if (data?.session) {
      navigate(tipoRol === 'empresa' ? '/empresa/vacantes' : '/mis-solicitudes')
    } else {
      navigate('/login?registrado=1')
    }
  }

  return (
    <>
      <div className="cabecera-editorial cabecera-editorial--centrada">
        <p>CREAR MI CUENTA</p>
        <h1>
          {tipoRol === 'empresa'
            ? 'Registra a tu empresa en AMAC'
            : 'Cuéntanos sobre ti'}
        </h1>
        <p>
          {tipoRol === 'empresa'
            ? 'Publica vacantes y conecta con personas adultas mayores con experiencia.'
            : 'Completa tus datos. Podemos ayudarte si lo necesitas.'}
        </p>
      </div>

      <div className="selector-rol" role="group" aria-label="Tipo de cuenta">
        <button
          type="button"
          className={`boton ${tipoRol === 'candidato' ? 'boton--coral' : ''}`}
          aria-pressed={tipoRol === 'candidato'}
          onClick={() => {
            setTipoRol('candidato')
            setMensaje('')
          }}
        >
          Soy candidato (busco empleo)
        </button>
        <button
          type="button"
          className={`boton ${tipoRol === 'empresa' ? 'boton--coral' : ''}`}
          aria-pressed={tipoRol === 'empresa'}
          onClick={() => {
            setTipoRol('empresa')
            setMensaje('')
          }}
        >
          Soy empresa (publico vacantes)
        </button>
      </div>

      <form
        className="formulario-registro"
        onSubmit={manejarRegistro}
        aria-label={
          tipoRol === 'empresa'
            ? 'Registro de empresa'
            : 'Registro de candidato'
        }
      >
        <p>Todos los campos marcados son obligatorios.</p>

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

        {tipoRol === 'candidato' ? (
          <>
            <fieldset>
              <legend>Datos personales y ubicación</legend>
              <div className="campos">
                <div className="campo-formulario">
                  <label htmlFor="nombre">Nombre completo</label>
                  <input
                    type="text"
                    id="nombre"
                    autoComplete="name"
                    placeholder="Ej. María López García"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                  />
                </div>

                <div className="campo-formulario">
                  <label htmlFor="edad">Edad (18 a 120 años)</label>
                  <input
                    type="number"
                    id="edad"
                    min="18"
                    max="120"
                    inputMode="numeric"
                    placeholder="Ej. 64"
                    value={edad}
                    onChange={(e) => setEdad(e.target.value)}
                    required
                  />
                </div>

                <div className="campo-formulario">
                  <label htmlFor="colonia">Colonia</label>
                  <input
                    type="text"
                    id="colonia"
                    autoComplete="address-line2"
                    placeholder="Ej. Centro, Monterrey"
                    value={colonia}
                    onChange={(e) => setColonia(e.target.value)}
                    required
                  />
                </div>

                <div className="campo-formulario">
                  <label htmlFor="telefono">Teléfono de contacto</label>
                  <input
                    type="tel"
                    id="telefono"
                    autoComplete="tel"
                    placeholder="Ej. 81 0000 0000"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    required
                  />
                </div>
              </div>
            </fieldset>

            <fieldset>
              <legend>Cuenta de acceso</legend>
              <div className="campos">
                <div className="campo-formulario">
                  <label htmlFor="correo-registro">Correo electrónico</label>
                  <input
                    type="email"
                    id="correo-registro"
                    autoComplete="email"
                    placeholder="nombre@correo.com"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    required
                  />
                </div>

                <div className="campo-formulario">
                  <label htmlFor="clave-registro">
                    Contraseña (mínimo 6 caracteres)
                  </label>
                  <input
                    type="password"
                    id="clave-registro"
                    autoComplete="new-password"
                    minLength="6"
                    value={contrasena}
                    onChange={(e) => setContrasena(e.target.value)}
                    required
                  />
                </div>
              </div>
            </fieldset>

            <fieldset>
              <legend>Experiencia laboral</legend>
              <div className="pila">
                <div className="campo-formulario">
                  <label htmlFor="experiencia">
                    Cuéntanos en qué has trabajado y tus habilidades
                  </label>
                  <textarea
                    id="experiencia"
                    placeholder="Por ejemplo: Atención a clientes durante 12 años, organización y trato amable."
                    value={experiencia}
                    onChange={(e) => setExperiencia(e.target.value)}
                    required
                  />
                </div>
              </div>
            </fieldset>
          </>
        ) : (
          /* RF-015: Registro de empresa versión simplificada */
          <fieldset>
            <legend>Datos de la empresa</legend>
            <div className="campos">
              <div className="campo-formulario">
                <label htmlFor="nombre-empresa">Nombre de la empresa</label>
                <input
                  type="text"
                  id="nombre-empresa"
                  placeholder="Ej. Mercado del Barrio"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                />
              </div>

              <div className="campo-formulario">
                <label htmlFor="giro-empresa">Giro de la empresa</label>
                <input
                  type="text"
                  id="giro-empresa"
                  placeholder="Ej. Comercio y atención al cliente"
                  value={giro}
                  onChange={(e) => setGiro(e.target.value)}
                  required
                />
              </div>

              <div className="campo-formulario">
                <label htmlFor="telefono-empresa">Teléfono de contacto</label>
                <input
                  type="tel"
                  id="telefono-empresa"
                  autoComplete="tel"
                  placeholder="Ej. 81 0000 0001"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  required
                />
              </div>

              <div className="campo-formulario">
                <label htmlFor="correo-empresa">Correo electrónico</label>
                <input
                  type="email"
                  id="correo-empresa"
                  autoComplete="email"
                  placeholder="contacto@empresa.com"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  required
                />
              </div>

              <div className="campo-formulario campo-completo">
                <label htmlFor="clave-empresa">
                  Contraseña (mínimo 6 caracteres)
                </label>
                <input
                  type="password"
                  id="clave-empresa"
                  autoComplete="new-password"
                  minLength="6"
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  required
                />
              </div>
            </div>
          </fieldset>
        )}

        {/* RF-013: Casilla obligatoria de términos */}
        <div className="aceptacion">
          <div className="opcion-aceptacion">
            <input
              type="checkbox"
              id="terminos"
              checked={aceptaTerminos}
              onChange={(e) => setAceptaTerminos(e.target.checked)}
              required
            />
            <label htmlFor="terminos">
              Acepto los términos y el aviso de privacidad de AMAC
            </label>
          </div>
          <details>
            <summary>Consultar términos y aviso de privacidad</summary>
            <p>
              Tus datos se utilizan únicamente dentro de la plataforma de empleo
              de AMAC para vincular candidatos con empresas registradas.
            </p>
          </details>
        </div>

        <button
          className="boton boton--coral boton--ancho"
          type="submit"
          disabled={cargando}
        >
          {cargando
            ? 'Registrando cuenta...'
            : tipoRol === 'empresa'
            ? 'Registrar empresa'
            : 'Enviar registro de candidato'}
        </button>

        {tipoRol === 'candidato' && (
          <p className="texto-centrado">
            Tu cuenta necesita la revisión y aprobación de AMAC antes de poder
            postularte a vacantes.
          </p>
        )}

        <Link className="boton boton--ancho" to="/login">
          Volver a iniciar sesión
        </Link>
      </form>
    </>
  )
}
