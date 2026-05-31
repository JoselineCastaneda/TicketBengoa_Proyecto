import { useRef, useState } from "react";
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

  const nombreRef = useRef(null);
  const apellidoRef = useRef(null);
  const correoRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmarRef = useRef(null);

  const navigate = useNavigate();

  const limpiarMensajes = () => {
    setError("");
    setMensaje("");
  };

  const handleRegistro = async () => {
    setError("");
    setMensaje("");

    const nombreLimpio = nombre.trim();
    const apellidoLimpio = apellido.trim();
    const correoLimpio = correo.trim().toLowerCase();

    const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const regexSoloLetras = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;

    if (!nombreLimpio) {
      setError("El nombre es obligatorio.");
      nombreRef.current.focus();
      return;
    }

    if (!regexSoloLetras.test(nombreLimpio)) {
      setError("El nombre no debe contener números.");
      nombreRef.current.focus();
      return;
    }

    if (!apellidoLimpio) {
      setError("El apellido es obligatorio.");
      apellidoRef.current.focus();
      return;
    }

    if (!regexSoloLetras.test(apellidoLimpio)) {
      setError("El apellido no debe contener números.");
      apellidoRef.current.focus();
      return;
    }

    if (!correoLimpio) {
      setError("El correo electrónico es obligatorio.");
      correoRef.current.focus();
      return;
    }

    if (!regexCorreo.test(correoLimpio)) {
      setError("Ingresa un correo válido.");
      correoRef.current.focus();
      return;
    }

    if (!password) {
      setError("La contraseña es obligatoria.");
      passwordRef.current.focus();
      return;
    }

    if (!confirmar) {
      setError("Debes confirmar la contraseña.");
      confirmarRef.current.focus();
      return;
    }

    if (password.length < 10) {
      setError("La contraseña debe tener al menos 10 caracteres.");
      passwordRef.current.focus();
      return;
    }

    if (password !== confirmar) {
      setError("Las contraseñas no coinciden.");
      confirmarRef.current.focus();
      return;
    }

    setLoading(true);

    const res = await registrarUsuario(
      nombreLimpio,
      apellidoLimpio,
      correoLimpio,
      password
    );

    setLoading(false);

    if (!res.ok) {
      setError(res.mensaje || "No se pudo registrar el usuario.");
      correoRef.current.focus();
      return;
    }

    setMensaje("Usuario registrado correctamente.");

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
          ref={nombreRef}
          className="login-input"
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => {
            setNombre(e.target.value);
            limpiarMensajes();
          }}
        />

        <input
          ref={apellidoRef}
          className="login-input"
          placeholder="Apellido"
          value={apellido}
          onChange={(e) => {
            setApellido(e.target.value);
            limpiarMensajes();
          }}
        />

        <input
          ref={correoRef}
          type="email"
          className="login-input"
          placeholder="Correo electrónico"
          value={correo}
          onChange={(e) => {
            setCorreo(e.target.value);
            limpiarMensajes();
          }}
        />

        <div className="password-box">
          <input
            ref={passwordRef}
            type={mostrar1 ? "text" : "password"}
            className="login-input password-input"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              limpiarMensajes();
            }}
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
            ref={confirmarRef}
            type={mostrar2 ? "text" : "password"}
            className="login-input password-input"
            placeholder="Confirmar contraseña"
            value={confirmar}
            onChange={(e) => {
              setConfirmar(e.target.value);
              limpiarMensajes();
            }}
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