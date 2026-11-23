import { Link } from 'react-router-dom'

export default function Boton({
  variante = '',
  ancho = false,
  to,
  href,
  type = 'button',
  children,
  ...props
}) {
  const clases = [
    'boton',
    variante === 'coral' ? 'boton--coral' : '',
    variante === 'azul' ? 'boton--azul' : '',
    ancho ? 'boton--ancho' : '',
  ]
    .filter(Boolean)
    .join(' ')

  if (to) {
    return (
      <Link className={clases} to={to} {...props}>
        {children}
      </Link>
    )
  }

  if (href) {
    return (
      <a className={clases} href={href} {...props}>
        {children}
      </a>
    )
  }

  return (
    <button className={clases} type={type} {...props}>
      {children}
    </button>
  )
}
