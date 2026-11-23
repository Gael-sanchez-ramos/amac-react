import { Link, NavLink, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function Encabezado() {
  const { sesion, perfil } = useAuth()
  const navigate = useNavigate()

  async function manejarCerrarSesion() {
    await supabase.auth.signOut()
    navigate('/')
  }

  return (
    <>
      <a className="saltar-contenido" href="#principal">
        Saltar al contenido
      </a>
      <header className="encabezado">
        <div className="contenedor encabezado__interior">
          <Link className="marca" to="/">
            <img
              src="/img/logo-amac.png"
              width="300"
              height="76"
              alt="AMAC, asociAMayores A.C. — Inicio"
            />
          </Link>

          <nav className="navegacion" aria-label="Navegación principal">
            <NavLink
              to="/"
              end
              className={({ isActive }) => (isActive ? 'activo' : undefined)}
            >
              Buscar empleo
            </NavLink>

            {(!perfil || perfil.rol === 'candidato') && (
              <NavLink to="/mis-solicitudes">Mis solicitudes</NavLink>
            )}

            {(!perfil || perfil.rol === 'empresa') && (
              <NavLink to="/empresa/vacantes">Mi empresa</NavLink>
            )}

            {perfil && <NavLink to="/perfil">Mi perfil</NavLink>}

            <a href="#ayuda">Ayuda</a>

            {!sesion ? (
              <NavLink to="/login">Iniciar sesión</NavLink>
            ) : (
              <button
                type="button"
                className="boton"
                onClick={manejarCerrarSesion}
              >
                Cerrar sesión
              </button>
            )}
          </nav>
        </div>
      </header>
    </>
  )
}
