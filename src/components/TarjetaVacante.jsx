import { Link } from 'react-router-dom'

export default function TarjetaVacante({ vacante }) {
  const sueldoFormateado = Number(vacante.sueldo || 0).toLocaleString('es-MX')
  const nombreEmpresa = vacante.empresa?.nombre || 'Empresa AMAC'

  return (
    <article
      className="tarjeta-vacante"
      aria-labelledby={`titulo-vacante-${vacante.id}`}
    >
      <p className="tarjeta-vacante__categoria">
        {(vacante.categoria || 'GENERAL').toUpperCase()} ·{' '}
        {(vacante.horario || 'HORARIO').toUpperCase()}
      </p>
      <h3 id={`titulo-vacante-${vacante.id}`} className="tarjeta-vacante__titulo">
        {vacante.titulo}
      </h3>
      <p className="tarjeta-vacante__empresa">
        {nombreEmpresa} · {vacante.ubicacion}
      </p>
      <p className="tarjeta-vacante__sueldo">
        ${sueldoFormateado} MXN mensuales
      </p>
      <ul className="tarjeta-vacante__datos">
        <li>
          <strong>Horario:</strong> {vacante.horario}
        </li>
        <li>
          <strong>Ubicación:</strong> {vacante.ubicacion}
        </li>
      </ul>
      <Link
        className="boton boton--coral"
        to={`/vacantes/${vacante.id}`}
        aria-label={`Ver vacante: ${vacante.titulo}`}
      >
        Ver vacante
      </Link>
    </article>
  )
}
