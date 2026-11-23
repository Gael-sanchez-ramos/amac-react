import { useEffect, useState } from 'react'
import { supabase, supabaseConfigurado } from '../lib/supabase'
import { VACANTES_DEMO } from '../lib/datosDemo'
import TarjetaVacante from '../components/TarjetaVacante'

export default function ListadoVacantes() {
  const [vacantes, setVacantes] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [textoBusqueda, setTextoBusqueda] = useState('')
  const [horario, setHorario] = useState('')
  const [categoria, setCategoria] = useState('')
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    async function cargar() {
      setCargando(true)

      if (!supabaseConfigurado) {
        const filtradas = VACANTES_DEMO.filter((v) => {
          const coincideTexto =
            !busqueda ||
            v.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
            v.ubicacion.toLowerCase().includes(busqueda.toLowerCase())
          const coincideHorario = !horario || v.horario === horario
          const coincideCategoria = !categoria || v.categoria === categoria
          return coincideTexto && coincideHorario && coincideCategoria
        })
        setVacantes(filtradas)
        setCargando(false)
        return
      }

      let consulta = supabase
        .from('vacantes')
        .select('*, empresa:perfiles(nombre)') // JOIN con la empresa
        .eq('estado', 'activa')
        .order('creada_en', { ascending: false })

      if (busqueda) {
        consulta = consulta.or(
          `titulo.ilike.%${busqueda}%,ubicacion.ilike.%${busqueda}%`
        )
      }
      if (horario) {
        consulta = consulta.eq('horario', horario)
      }
      if (categoria) {
        consulta = consulta.eq('categoria', categoria)
      }

      const { data, error } = await consulta
      if (!error && data) {
        setVacantes(data)
      }
      setCargando(false)
    }

    cargar()
  }, [busqueda, horario, categoria]) // se vuelve a consultar cuando cambian

  function manejarSubmitBusqueda(e) {
    e.preventDefault()
    setBusqueda(textoBusqueda.trim())
  }

  function limpiarFiltros() {
    setTextoBusqueda('')
    setBusqueda('')
    setHorario('')
    setCategoria('')
  }

  return (
    <>
      <section className="hero" aria-labelledby="titulo-inicio">
        <div className="hero__presentacion">
          <div className="pila">
            <p className="hero__entrada">AMAC · OPORTUNIDADES CON EXPERIENCIA</p>
            <h1 className="hero__titulo" id="titulo-inicio">
              Tu experiencia
              <br />
              abre caminos.
            </h1>
            <p className="hero__subtitulo">
              Encuentra un empleo que valore todo lo que sabes.
            </p>
          </div>
          <aside className="acompanamiento" aria-label="Acompañamiento AMAC">
            <p className="acompanamiento__titulo">
              Envejecer
              <br />
              es vivir.
            </p>
            <img
              className="acompanamiento__imagen"
              src="/img/acompanamiento.svg"
              width="264"
              height="88"
              alt=""
            />
            <p>A tu ritmo. Con orientación de AMAC.</p>
          </aside>
        </div>

        <form
          className="busqueda"
          role="search"
          onSubmit={manejarSubmitBusqueda}
        >
          <div className="campo-formulario">
            <label htmlFor="busqueda">Empleo o ubicación</label>
            <input
              type="search"
              id="busqueda"
              name="q"
              placeholder="¿Qué empleo o ubicación buscas?"
              value={textoBusqueda}
              onChange={(e) => {
                setTextoBusqueda(e.target.value)
                setBusqueda(e.target.value.trim())
              }}
            />
          </div>
          <button className="boton boton--azul" type="submit">
            Buscar vacantes
          </button>
        </form>
      </section>

      <div className="filtros-resultados">
        <aside className="filtros pila" aria-labelledby="titulo-filtros">
          <h2 id="titulo-filtros">Encuentra tu opción</h2>
          <div className="pila">
            <div className="campo-formulario">
              <label htmlFor="horario">Horario</label>
              <select
                id="horario"
                name="horario"
                value={horario}
                onChange={(e) => setHorario(e.target.value)}
              >
                <option value="">Todos los horarios</option>
                <option value="Matutino">Matutino</option>
                <option value="Vespertino">Vespertino</option>
                <option value="Medio tiempo">Medio tiempo</option>
                <option value="Fines de semana">Fines de semana</option>
              </select>
            </div>

            <div className="campo-formulario">
              <label htmlFor="categoria">Categoría</label>
              <select
                id="categoria"
                name="categoria"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
              >
                <option value="">Todas las categorías</option>
                <option value="Atención al cliente">Atención al cliente</option>
                <option value="Ventas">Ventas</option>
                <option value="Administración">Administración</option>
                <option value="Mantenimiento">Mantenimiento</option>
              </select>
            </div>

            <button
              className="boton"
              type="button"
              onClick={limpiarFiltros}
            >
              Limpiar filtros
            </button>
          </div>
        </aside>

        <section
          className="pila"
          id="resultados"
          aria-labelledby="titulo-resultados"
        >
          <h2 id="titulo-resultados">
            {cargando
              ? 'Buscando vacantes...'
              : `${vacantes.length} ${
                  vacantes.length === 1
                    ? 'vacante disponible'
                    : 'vacantes disponibles'
                }`}
          </h2>

          {cargando && <p role="status">Cargando vacantes...</p>}

          {!cargando && vacantes.length === 0 && (
            <p role="status" className="aviso-estado">
              No hay vacantes para mostrar.
            </p>
          )}

          <div className="lista-vacantes">
            {vacantes.map((v) => (
              <TarjetaVacante key={v.id} vacante={v} />
            ))}
          </div>
        </section>
      </div>
    </>
  )
}
