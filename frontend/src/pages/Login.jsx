import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { loginUsuario } from "../auth/auth";
import "../styles/login.css";

const Login = () => {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [mostrar, setMostrar] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async () => {
    setError("");

    if (!correo || !password) {
      setError("Todos los campos son obligatorios");
      return;
    }

    setLoading(true);

    const res = await loginUsuario(correo, password);

    setLoading(false);

    if (!res.ok) {
      setError(res.mensaje);
      return;
    }

    if (res.usuario.rol === "administrador") {
      navigate("/admin");
    } else if (res.usuario.rol === "cliente") {
      navigate("/cliente");
    } else if (res.usuario.rol === "validador") {
      navigate("/validador");
    } else {
      setError("Rol no reconocido");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Iniciar Sesión</h2>

        {error && <p className="login-error">{error}</p>}

        <input
          type="email"
          placeholder="Correo electrónico"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          className="login-input"
        />

        <div className="password-box">
          <input
            type={mostrar ? "text" : "password"}
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="login-input password-input"
          />

          <button
            type="button"
            className="eye-btn"
            onClick={() => setMostrar(!mostrar)}
          >
            {mostrar ? <FiEyeOff /> : <FiEye />}
          </button>
        </div>

        <p className="login-link" onClick={() => navigate("/recuperar")}>
          ¿Olvidaste tu contraseña?
        </p>

        <button
          className="login-btn"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Cargando..." : "Ingresar"}
        </button>

        <p className="signup" onClick={() => navigate("/registro")}>
          ¿No tienes cuenta? Registrarse
        </p>
      </div>
    </div>
  );
};

export default Login;