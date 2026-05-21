import {
  FiLock,
  FiMail,
  FiUserCheck,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";

import { useState } from "react";

const UsuariosForm = ({
  form,
  loading,
  handleChange,
  crearUsuario,
}) => {
  const [mostrarPassword, setMostrarPassword] =
    useState(false);

  const [mostrarConfirmar, setMostrarConfirmar] =
    useState(false);

  return (
    <aside className="usuarios-form-card">
      <div className="usuarios-form-title">
        <FiUserCheck />

        <div>
          <h2>Crear nuevo usuario</h2>

          <p>
            Registra usuarios administrativos o validadores.
          </p>
        </div>
      </div>

      <div className="usuarios-form">
        <label>
          Nombre

          <input
            type="text"
            name="nombre"
            placeholder="Ej: Joseline"
            value={form.nombre}
            onChange={handleChange}
          />
        </label>

        <label>
          Apellido

          <input
            type="text"
            name="apellido"
            placeholder="Ej: Castaneda"
            value={form.apellido}
            onChange={handleChange}
          />
        </label>

        <label>
          Correo electrónico

          <div className="usuarios-input-icon">
            <FiMail />

            <input
              type="email"
              name="correo_electronico"
              placeholder="correo@ejemplo.com"
              value={form.correo_electronico}
              onChange={handleChange}
            />
          </div>
        </label>

        <label>
          Rol

          <select
            name="rol"
            value={form.rol}
            onChange={handleChange}
          >
            <option value="validador">
              Validador
            </option>

            <option value="administrador">
              Administrador
            </option>
          </select>
        </label>

        <label>
          Contraseña

          <div className="usuarios-input-icon">
            <FiLock />

            <div className="usuarios-password-wrapper">
              <input
                type={
                  mostrarPassword
                    ? "text"
                    : "password"
                }
                name="contrasena"
                placeholder="Mínimo 6 caracteres"
                value={form.contrasena}
                onChange={handleChange}
              />

              <button
                type="button"
                className="usuarios-password-toggle"
                onClick={() =>
                  setMostrarPassword(
                    !mostrarPassword
                  )
                }
              >
                {mostrarPassword ? (
                  <FiEyeOff />
                ) : (
                  <FiEye />
                )}
              </button>
            </div>
          </div>
        </label>

        <label>
          Confirmar contraseña

          <div className="usuarios-input-icon">
            <FiLock />

            <div className="usuarios-password-wrapper">
              <input
                type={
                  mostrarConfirmar
                    ? "text"
                    : "password"
                }
                name="confirmar_contrasena"
                placeholder="Repite la contraseña"
                value={form.confirmar_contrasena}
                onChange={handleChange}
              />

              <button
                type="button"
                className="usuarios-password-toggle"
                onClick={() =>
                  setMostrarConfirmar(
                    !mostrarConfirmar
                  )
                }
              >
                {mostrarConfirmar ? (
                  <FiEyeOff />
                ) : (
                  <FiEye />
                )}
              </button>
            </div>
          </div>
        </label>

        <button
          type="button"
          onClick={crearUsuario}
          disabled={loading}
        >
          {loading
            ? "Creando..."
            : "Crear usuario"}
        </button>
      </div>
    </aside>
  );
};

export default UsuariosForm;