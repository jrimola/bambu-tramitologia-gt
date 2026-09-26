import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import { doc, onSnapshot } from 'firebase/firestore'
import { auth, db, googleProvider } from '../firebase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [usuario, setUsuario] = useState(null)
  const [cargandoAuth, setCargandoAuth] = useState(true)
  const [cargandoUsuario, setCargandoUsuario] = useState(false)

  useEffect(() => {
    return onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      setCargandoAuth(false)
    })
  }, [])

  useEffect(() => {
    if (!user) {
      setUsuario(null)
      return
    }
    setCargandoUsuario(true)
    const correo = user.email.toLowerCase()
    const unsub = onSnapshot(
      doc(db, 'usuarios', correo),
      (snap) => {
        setUsuario(snap.exists() ? snap.data() : null)
        setCargandoUsuario(false)
      },
      () => {
        // Sin permiso de lectura: no esta registrado o no esta activo.
        setUsuario(null)
        setCargandoUsuario(false)
      },
    )
    return unsub
  }, [user])

  const value = {
    user,
    usuario,
    cargando: cargandoAuth || (!!user && cargandoUsuario),
    tieneAcceso: !!usuario && usuario.activo === true,
    rol: usuario?.rol ?? null,
    iniciarSesion: () => signInWithPopup(auth, googleProvider),
    cerrarSesion: () => signOut(auth),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
