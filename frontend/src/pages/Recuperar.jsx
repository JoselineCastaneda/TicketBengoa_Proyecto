import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { recuperarPassword } from "../auth/auth";
import "../styles/login.css";

const Recuperar = () => {
  const [correo, setCorreo] = useState("");
  const [nuevaPassword, setNuevaPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");

  const [mostrar1, setMostrar1] = useState(false);
  const [mostrar2, setMostrar2] = useState(false);

  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleRecuperar = async () => {
    setError("");
    setMensaje("");

    if (!correo || !nuevaPassword || !confirmarPassword) {
      setError("Todos los campos son obligatorios");
      return;
    }

    if (nuevaPassword.length < 6) {
      setError("La nueva contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (nuevaPassword !== confirmarPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);

    const res = await recuperarPassword(correo, nuevaPassword);

    setLoading(false);

    if (!res.ok) {
      setError(res.mensaje);
      setCorreo("");
      setNuevaPassword("");
      setConfirmarPassword("");
      return;
    }

    setMensaje("Contraseña actualizada correctamente");

    setCorreo("");
    setNuevaPassword("");
    setConfirmarPassword("");

    setTimeout(() => {
      navigate("/login");
    }, 1500);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Recuperar Contraseña</h2>

        {error && <p className="login-error">{error}</p>}
        {mensaje && <p className="login-success">{mensaje}</p>}

        <input
          className="login-input"
          placeholder="Correo electrónico"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
        />

        <div className="password-box">
          <input
            type={mostrar1 ? "text" : "password"}
            className="login-input password-input"
            placeholder="Nueva contraseña"
            value={nuevaPassword}
            onChange={(e) => setNuevaPassword(e.target.value)}
          />

          <button
            type="button"
            className="eye-btn"
            onClick={() => setMostrar1(!mostrar1)}
          >
            {mostrar1 ? <FiEyeOff /> : <FiEye />}
          </button>
        </div>

        <div className="password-box">
          <input
            type={mostrar2 ? "text" : "password"}
            className="login-input password-input"
            placeholder="Confirmar nueva contraseña"
            value={confirmarPassword}
            onChange={(e) => setConfirmarPassword(e.target.value)}
          />

          <button
            type="button"
            className="eye-btn"
            onClick={() => setMostrar2(!mostrar2)}
          >
            {mostrar2 ? <FiEyeOff /> : <FiEye />}
          </button>
        </div>

        <button
          className="login-btn"
          onClick={handleRecuperar}
          disabled={loading}
        >
          {loading ? "Actualizando..." : "Recuperar"}
        </button>

        <p className="signup" onClick={() => navigate("/login")}>
          Volver al inicio de sesión
        </p>
      </div>
    </div>
  );
};

export default Recuperar;