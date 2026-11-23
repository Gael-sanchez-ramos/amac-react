import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [cargando, setCargando] = useState(false)

  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const registroExitoso = searchParams.get('registrado') === '1'

  // Inicio de sesión (RF-008)
  async function manejarLogin(e) {
    e.preventDefault()
    setMensaje('')
    setCargando(true)

    const { data, error } = await supabase.auth.signInWithPassword({
      email: correo.trim(),
      password: contrasena,
    })

    if (error) {
      // Mensaje genérico: no decir cuál falló (RF-008)
      setMensaje('Correo o contraseña incorrectos.')
      setCargando(false)
      return
    }

    // Consultar rol para dirigir a su panel correspondiente
    const userId = data?.user?.id
    if (userId) {
      const { data: perfilData } = await supabase
        .from('perfiles')
        .select('rol')
        .eq('id', userId)
        .single()

      if (perfilData?.rol === 'empresa') {
        navigate('/empresa/vacantes')
        return
      }
    }

    navigate('/mis-solicitudes')
  }

  return (
    <div className="acceso">
      <section className="mensaje-marca" aria-label="Tu siguiente etapa">
        <div className="mensaje-marca__logo">
          <img
            src="/img/logo-amac.png"
            width="300"
            height="76"
            alt="AMAC, asociAMayores A.C."
          />
        </div>
        <p className="mensaje-marca__titulo">
          Tu siguiente etapa
          <br />
          empieza contigo.
        </p>
        <p className="mensaje-marca__texto">Tu próximo empleo empieza aquí.</p>
        <p>Con orientación de AMAC, a tu ritmo.</p>
        <a className="boton" href="#ayuda">
          ¿Necesitas ayuda de AMAC?
        </a>
      </section>

      <section
        className="acceso__cuenta pila"
        aria-labelledby="titulo-acceso"
      >
        <h1 id="titulo-acceso">Inicia sesión en AMAC</h1>

        {registroExitoso && (
          <p className="aviso-estado aviso-estado--exito" role="status">
            ¡Cuenta creada con éxito! Inicia sesión con tu correo y contraseña.
          </p>
        )}

        {mensaje && (
          <p className="aviso-estado aviso-estado--error" role="alert">
            {mensaje}
          </p>
        )}

        <form className="pila" onSubmit={manejarLogin}>
          <div className="formulario-acceso">
            <div className="campo-formulario">
              <label htmlFor="correo">Correo electrónico</label>
              <input
                type="email"
                id="correo"
                autoComplete="email"
                placeholder="nombre@correo.com"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
              />
            </div>

            <div className="campo-formulario">
              <label htmlFor="clave">Contraseña</label>
              <input
                type="password"
                id="clave"
                autoComplete="current-password"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                required
              />
            </div>
          </div>

          <p>
            Entra a tu cuenta para explorar vacantes o administrar tus
            solicitudes. AMAC debe aprobar el registro de candidatos para
            postularse.
          </p>

          <button
            className="boton boton--azul boton--ancho"
            type="submit"
            disabled={cargando}
          >
            {cargando ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </form>

        <p className="texto-centrado">¿Aún no tienes cuenta?</p>
        <Link className="boton boton--coral boton--ancho" to="/registro">
          Crear cuenta de candidato
        </Link>
        <Link className="boton boton--ancho" to="/registro-empresa">
          Registrar mi empresa
        </Link>
        <Link className="boton boton--ancho" to="/">
          Volver al inicio
        </Link>
      </section>
    </div>
  )
}
