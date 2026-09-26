import { useState } from 'react'
import { useAuth } from './contexts/AuthContext'
import Login from './components/Login'
import SolicitaAcceso from './components/SolicitaAcceso'
import Usuarios from './components/Usuarios'
import './App.css'

function App() {
  const { user, cargando, tieneAcceso, rol, usuario, cerrarSesion } = useAuth()
  const [vista, setVista] = useState('inicio')

  if (cargando) {
    return <div className="pantalla-centrada">Cargando...</div>
  }

  if (!user) {
    return <Login />
  }

  if (!tieneAcceso) {
    return <SolicitaAcceso />
  }

  return (
    <div className="app">
      <header className="barra-superior">
        <span className="marca">Tramitología GT</span>
        <nav>
          <button className={vista === 'inicio' ? 'activo' : ''} onClick={() => setVista('inicio')}>
            Inicio
          </button>
          {rol === 'admin' && (
            <button className={vista === 'usuarios' ? 'activo' : ''} onClick={() => setVista('usuarios')}>
              Usuarios
            </button>
          )}
        </nav>
        <div className="usuario-actual">
          <span>
            {usuario.nombre} · {rol}
          </span>
          <button onClick={() => cerrarSesion()}>Cerrar sesión</button>
        </div>
      </header>

      <main>
        {vista === 'usuarios' && rol === 'admin' ? (
          <Usuarios />
        ) : (
          <p className="placeholder">
            Dashboard, agenda, calendario, bitácora y trámites llegan en los próximos pasos.
          </p>
        )}
      </main>
    </div>
  )
}

export default App
