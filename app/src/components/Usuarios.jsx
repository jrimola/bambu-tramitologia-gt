import { useEffect, useState } from 'react'
import { collection, doc, getDoc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../contexts/AuthContext'

const ROLES = ['consulta', 'gestor', 'admin']

export default function Usuarios() {
  const { user } = useAuth()
  const miCorreo = user.email.toLowerCase()

  const [usuarios, setUsuarios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [nuevoCorreo, setNuevoCorreo] = useState('')
  const [nuevoNombre, setNuevoNombre] = useState('')
  const [nuevoRol, setNuevoRol] = useState('consulta')
  const [error, setError] = useState('')

  useEffect(() => {
    return onSnapshot(collection(db, 'usuarios'), (snap) => {
      const lista = snap.docs
        .map((d) => ({ correo: d.id, ...d.data() }))
        .sort((a, b) => a.nombre.localeCompare(b.nombre))
      setUsuarios(lista)
      setCargando(false)
    })
  }, [])

  async function agregarUsuario(e) {
    e.preventDefault()
    setError('')
    const correo = nuevoCorreo.trim().toLowerCase()
    if (!correo || !nuevoNombre.trim()) {
      setError('Correo y nombre son obligatorios.')
      return
    }
    const ref = doc(db, 'usuarios', correo)
    const existente = await getDoc(ref)
    if (existente.exists()) {
      setError('Ese correo ya está registrado. Edítalo en la lista de abajo.')
      return
    }
    await setDoc(ref, { nombre: nuevoNombre.trim(), rol: nuevoRol, activo: true })
    setNuevoCorreo('')
    setNuevoNombre('')
    setNuevoRol('consulta')
  }

  function cambiarRol(correo, rol) {
    updateDoc(doc(db, 'usuarios', correo), { rol })
  }

  function alternarActivo(correo, activo) {
    updateDoc(doc(db, 'usuarios', correo), { activo: !activo })
  }

  if (cargando) return <p>Cargando usuarios...</p>

  return (
    <section className="usuarios">
      <h2>Usuarios</h2>

      <form className="form-usuario" onSubmit={agregarUsuario}>
        <input
          type="email"
          placeholder="correo@bambudev.com"
          value={nuevoCorreo}
          onChange={(e) => setNuevoCorreo(e.target.value)}
        />
        <input
          type="text"
          placeholder="Nombre"
          value={nuevoNombre}
          onChange={(e) => setNuevoNombre(e.target.value)}
        />
        <select value={nuevoRol} onChange={(e) => setNuevoRol(e.target.value)}>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <button type="submit">Agregar</button>
      </form>
      {error && <p className="error">{error}</p>}

      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Rol</th>
            <th>Estado</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((u) => {
            const esUnoMismo = u.correo === miCorreo
            return (
              <tr key={u.correo}>
                <td>{u.nombre}</td>
                <td>{u.correo}</td>
                <td>
                  <select
                    value={u.rol}
                    disabled={esUnoMismo}
                    onChange={(e) => cambiarRol(u.correo, e.target.value)}
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </td>
                <td>{u.activo ? 'Activo' : 'Desactivado'}</td>
                <td>
                  <button disabled={esUnoMismo} onClick={() => alternarActivo(u.correo, u.activo)}>
                    {u.activo ? 'Desactivar' : 'Activar'}
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </section>
  )
}
