import { useAuth } from '../contexts/AuthContext'

export default function SolicitaAcceso() {
  const { user, cerrarSesion } = useAuth()

  return (
    <div className="pantalla-centrada">
      <h1>Solicita acceso</h1>
      <p>
        Tu cuenta ({user?.email}) todavía no tiene acceso a Tramitología GT.
        Pide a un administrador que te agregue desde la pantalla de Usuarios.
      </p>
      <button onClick={() => cerrarSesion()}>Cerrar sesión</button>
    </div>
  )
}
