import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const { iniciarSesion } = useAuth()

  return (
    <div className="pantalla-centrada">
      <h1>Tramitología GT</h1>
      <p>Inicia sesión con tu cuenta de BAMBU (@bambudev.com).</p>
      <button onClick={() => iniciarSesion()}>Iniciar sesión con Google</button>
    </div>
  )
}
