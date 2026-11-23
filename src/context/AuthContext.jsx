import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase, supabaseConfigurado } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [sesion, setSesion] = useState(undefined) // undefined = todavía no sabemos
  const [perfil, setPerfil] = useState(null)
  const [cargando, setCargando] = useState(true)

  // 1) Escuchar la sesión: al abrir la página, al iniciar y al cerrar sesión
  useEffect(() => {
    if (!supabaseConfigurado) {
      setSesion(null)
      setCargando(false)
      return
    }

    supabase.auth.getSession().then(({ data }) => {
      setSesion(data?.session ?? null)
    }).catch(() => {
      setSesion(null)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_evento, nuevaSesion) => {
      setSesion(nuevaSesion)
    })

    return () => subscription.unsubscribe()
  }, [])

  // 2) Cada vez que cambia la sesión, cargar el perfil (rol, nombre, aprobado...)
  const sesionLista = sesion !== undefined
  const usuarioId = sesion?.user?.id

  const cargarPerfil = useCallback(async (uid) => {
    if (!uid || !supabaseConfigurado) {
      setPerfil(null)
      setCargando(false)
      return
    }
    setCargando(true)
    const { data } = await supabase
      .from('perfiles')
      .select('*')
      .eq('id', uid)
      .single()
    setPerfil(data ?? null)
    setCargando(false)
  }, [])

  useEffect(() => {
    if (!sesionLista) return
    if (!usuarioId) {
      setPerfil(null)
      setCargando(false)
      return
    }
    cargarPerfil(usuarioId)
  }, [sesionLista, usuarioId, cargarPerfil])

  const recargarPerfil = () => {
    if (usuarioId) cargarPerfil(usuarioId)
  }

  return (
    <AuthContext.Provider value={{ sesion, perfil, cargando, recargarPerfil }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
