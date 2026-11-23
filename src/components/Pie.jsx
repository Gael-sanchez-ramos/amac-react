export default function Pie() {
  return (
    <footer className="pie contenedor">
      <p>AMAC · Envejecer es vivir.</p>
      <section className="ayuda" id="ayuda" aria-labelledby="titulo-ayuda">
        <h2 id="titulo-ayuda">¿Necesitas ayuda de AMAC?</h2>
        <p>
          Podemos orientarte con tu registro y tus solicitudes. Llámanos y te
          ayudamos.
        </p>
        <a className="boton boton--coral" href="tel:+528100000000">
          Llamar a AMAC: 81&nbsp;0000&nbsp;0000
        </a>
        <details>
          <summary>Ver ayuda para continuar</summary>
          <p>
            Para buscar empleo, explora las vacantes y abre la que te interese.
            Crea tu cuenta para registrar tus datos. AMAC debe aprobar tu
            registro antes de que puedas postularte.
          </p>
          <p>
            Si representas a una empresa, visita el panel de Mi empresa para
            publicar vacantes y revisar solicitudes.
          </p>
        </details>
      </section>
    </footer>
  )
}
