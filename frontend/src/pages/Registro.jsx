import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { registrarUsuario } from "../auth/auth";
import "../styles/login.css";

const Registro = () => {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");

  const [mostrar1, setMostrar1] = useState(false);
  const [mostrar2, setMostrar2] = useState(false);

  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleRegistro = async () => {
    setError("");
    setMensaje("");

    if (!nombre || !apellido || !correo || !password || !confirmar) {
      setError("Todos los campos son obligatorios");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (password !== confirmar) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);

    const res = await registrarUsuario(
      nombre,
      apellido,
      correo,
      password
    );

    setLoading(false);

    if (!res.ok) {
      setError(res.mensaje);

      setNombre("");
      setApellido("");
      setCorreo("");
      setPassword("");
      setConfirmar("");
      return;
    }

    setMensaje("Usuario registrado correctamente");

    setNombre("");
    setApellido("");
    setCorreo("");
    setPassword("");
    setConfirmar("");

    setTimeout(() => {
      navigate("/login");
    }, 1500);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Registro</h2>

        {error && <p className="login-error">{error}</p>}
        {mensaje && <p className="login-success">{mensaje}</p>}

        <input
          className="login-input"
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />

        <input
          className="login-input"
          placeholder="Apellido"
          value={apellido}
          onChange={(e) => setApellido(e.target.value)}
        />

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
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
            placeholder="Confirmar contraseña"
            value={confirmar}
            onChange={(e) => setConfirmar(e.target.value)}
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
          onClick={handleRegistro}
          disabled={loading}
        >
          {loading ? "Registrando..." : "Registrarme"}
        </button>

        <p className="signup" onClick={() => navigate("/login")}>
          ¿Ya tienes cuenta? Iniciar sesión
        </p>
      </div>
    </div>
  );
};

export default Registro;