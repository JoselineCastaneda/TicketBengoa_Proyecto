import { useEffect, useState } from "react";
import {
  FiLock,
  FiMail,
  FiSearch,
  FiShield,
  FiUser,
  FiUserCheck,
  FiUsers,
} from "react-icons/fi";

import { obtenerToken, obtenerUsuarioActivo } from "../../auth/auth";
import "../../styles/admin/usuarios.css";

const API_URL = "http://localhost:3000/api";

const UsuariosAdmin = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroRol, setFiltroRol] = useState("todos");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [paginaActual, setPaginaActual] = useState(1);

  const usuariosPorPagina = 6;

  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    correo_electronico: "",
    contrasena: "",
    confirmar_contrasena: "",
    rol: "validador",
  });

  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const token = obtenerToken();
  const usuarioActivo = obtenerUsuarioActivo();

  const obtenerUsuarios = async () => {
    try {
      const response = await fetch(`${API_URL}/usuarios`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.ok) {
        setUsuarios(data.usuarios);
      }
    } catch {
      setError("Error al cargar usuarios");
    }
  };

  useEffect(() => {
    obtenerUsuarios();
  }, []);

  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda, filtroRol, filtroEstado]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const limpiarFormulario = () => {
    setForm({
      nombre: "",
      apellido: "",
      correo_electronico: "",
      contrasena: "",
      confirmar_contrasena: "",
      rol: "validador",
    });
  };

  const crearUsuario = async () => {
    setMensaje("");
    setError("");

    if (
      !form.nombre ||
      !form.apellido ||
      !form.correo_electronico ||
      !form.contrasena ||
      !form.confirmar_contrasena ||
      !form.rol
    ) {
      setError("Todos los campos son obligatorios");
      return;
    }

    if (form.contrasena.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (form.contrasena !== form.confirmar_contrasena) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        nombre: form.nombre,
        apellido: form.apellido,
        correo_electronico: form.correo_electronico,
        contrasena: form.contrasena,
        rol: form.rol,
      };

      const response = await fetch(`${API_URL}/usuarios`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!data.ok) {
        setError(data.mensaje || "Error al crear usuario");
        return;
      }

      setMensaje("Usuario creado correctamente");
      limpiarFormulario();
      obtenerUsuarios();
    } catch {
      setError("Error al crear usuario");
    } finally {
      setLoading(false);
    }
  };

  const cambiarEstado = async (usuario, estadoNuevo) => {
    setMensaje("");
    setError("");

    if (Number(usuarioActivo?.id_usuario) === Number(usuario.id_usuario)) {
      setError("No puedes cambiar el estado de tu propio usuario");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/usuarios/${usuario.id_usuario}/estado`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ estado: estadoNuevo }),
        }
      );

      const data = await response.json();

      if (!data.ok) {
        setError(data.mensaje || "Error al actualizar estado");
        return;
      }

      setMensaje("Estado actualizado correctamente");
      obtenerUsuarios();
    } catch {
      setError("Error al actualizar estado");
    }
  };

  const obtenerIniciales = (usuario) => {
    const nombre = usuario.nombre?.charAt(0) || "";
    const apellido = usuario.apellido?.charAt(0) || "";

    return `${nombre}${apellido}`.toUpperCase() || "U";
  };

  const usuariosFiltrados = usuarios.filter((usuario) => {
    const texto = `
      ${usuario.nombre || ""}
      ${usuario.apellido || ""}
      ${usuario.correo_electronico || ""}
      ${usuario.rol || ""}
      ${usuario.estado || ""}
    `.toLowerCase();

    const coincideBusqueda = texto.includes(busqueda.toLowerCase());
    const coincideRol = filtroRol === "todos" || usuario.rol === filtroRol;
    const coincideEstado =
      filtroEstado === "todos" || usuario.estado === filtroEstado;

    return coincideBusqueda && coincideRol && coincideEstado;
  });

  const totalPaginas = Math.ceil(usuariosFiltrados.length / usuariosPorPagina);

  const indiceFinal = paginaActual * usuariosPorPagina;
  const indiceInicio = indiceFinal - usuariosPorPagina;

  const usuariosPaginados = usuariosFiltrados.slice(
    indiceInicio,
    indiceFinal
  );

  const totalAdministradores = usuarios.filter(
    (usuario) => usuario.rol === "administrador"
  ).length;

  const totalValidadores = usuarios.filter(
    (usuario) => usuario.rol === "validador"
  ).length;

  const totalClientes = usuarios.filter(
    (usuario) => usuario.rol === "cliente"
  ).length;

  return (
    <section className="usuarios-admin-page">
      <header className="usuarios-header">
        <div>
          <span className="usuarios-eyebrow">Administración</span>
          <h1>Gestión de Usuarios</h1>
          <p>Administra usuarios, roles y estados dentro del sistema.</p>
        </div>
      </header>

      <section className="usuarios-stats-grid">
        <article className="usuarios-stat-card purple">
          <FiUsers />
          <div>
            <span>Total usuarios</span>
            <strong>{usuarios.length}</strong>
          </div>
        </article>

        <article className="usuarios-stat-card blue">
          <FiShield />
          <div>
            <span>Administradores</span>
            <strong>{totalAdministradores}</strong>
          </div>
        </article>

        <article className="usuarios-stat-card green">
          <FiUserCheck />
          <div>
            <span>Validadores</span>
            <strong>{totalValidadores}</strong>
          </div>
        </article>

        <article className="usuarios-stat-card pink">
          <FiUser />
          <div>
            <span>Clientes</span>
            <strong>{totalClientes}</strong>
          </div>
        </article>
      </section>

      <section className="usuarios-toolbar">
        <div className="usuarios-search-box">
          <FiSearch />
          <input
            type="text"
            placeholder="Buscar por nombre, correo, rol o estado..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <select value={filtroRol} onChange={(e) => setFiltroRol(e.target.value)}>
          <option value="todos">Todos los roles</option>
          <option value="administrador">Administradores</option>
          <option value="validador">Validadores</option>
          <option value="cliente">Clientes</option>
        </select>

        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
        >
          <option value="todos">Todos los estados</option>
          <option value="activo">Activos</option>
          <option value="inactivo">Inactivos</option>
          <option value="bloqueado">Bloqueados</option>
        </select>

        <span>{usuariosFiltrados.length} usuarios</span>
      </section>

      {mensaje && <p className="admin-success">{mensaje}</p>}
      {error && <p className="admin-error">{error}</p>}

      <section className="usuarios-content-layout">
        <div className="usuarios-table-card">
          <table className="usuarios-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Correo</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Fecha registro</th>
                <th>Cambiar estado</th>
              </tr>
            </thead>

            <tbody>
              {usuariosPaginados.map((usuario) => (
                <tr key={usuario.id_usuario}>
                  <td>
                    <div className="usuario-info">
                      <div className={`usuario-avatar rol-${usuario.rol}`}>
                        {obtenerIniciales(usuario)}
                      </div>

                      <div>
                        <strong>
                          {usuario.nombre} {usuario.apellido}
                        </strong>
                        <small>@{usuario.nombre?.toLowerCase()}</small>
                      </div>
                    </div>
                  </td>

                  <td>{usuario.correo_electronico}</td>

                  <td>
                    <span className={`usuario-rol rol-${usuario.rol}`}>
                      {usuario.rol}
                    </span>
                  </td>

                  <td>
                    <span className={`usuario-estado estado-${usuario.estado}`}>
                      {usuario.estado}
                    </span>
                  </td>

                  <td>
                    {usuario.fecha_registro
                      ? usuario.fecha_registro.split("T")[0]
                      : ""}
                  </td>

                  <td>
                    <select
                      className="estado-select"
                      value={usuario.estado}
                      disabled={
                        Number(usuarioActivo?.id_usuario) ===
                        Number(usuario.id_usuario)
                      }
                      onChange={(e) => cambiarEstado(usuario, e.target.value)}
                    >
                      <option value="activo">Activo</option>
                      <option value="inactivo">Inactivo</option>
                      <option value="bloqueado">Bloqueado</option>
                    </select>
                  </td>
                </tr>
              ))}

              {usuariosFiltrados.length === 0 && (
                <tr>
                  <td colSpan="6" className="tabla-vacia">
                    No hay usuarios que coincidan con la búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="usuarios-pagination">
            <span>
              Mostrando{" "}
              {usuariosFiltrados.length === 0 ? 0 : indiceInicio + 1} a{" "}
              {Math.min(indiceFinal, usuariosFiltrados.length)} de{" "}
              {usuariosFiltrados.length} usuarios · Página {paginaActual} de{" "}
              {totalPaginas || 1}
            </span>

            <div className="usuarios-pagination-actions">
              <button
                type="button"
                disabled={paginaActual === 1}
                onClick={() => setPaginaActual((prev) => prev - 1)}
              >
                Anterior
              </button>

              <strong>
                {paginaActual} / {totalPaginas || 1}
              </strong>

              <button
                type="button"
                disabled={paginaActual === totalPaginas || totalPaginas === 0}
                onClick={() => setPaginaActual((prev) => prev + 1)}
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>

        <aside className="usuarios-form-card">
          <div className="usuarios-form-title">
            <FiUserCheck />
            <div>
              <h2>Crear nuevo usuario</h2>
              <p>Registra usuarios administrativos o validadores.</p>
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
              <select name="rol" value={form.rol} onChange={handleChange}>
                <option value="validador">Validador</option>
                <option value="administrador">Administrador</option>
              </select>
            </label>

            <label>
              Contraseña
              <div className="usuarios-input-icon">
                <FiLock />
                <input
                  type="password"
                  name="contrasena"
                  placeholder="Mínimo 6 caracteres"
                  value={form.contrasena}
                  onChange={handleChange}
                />
              </div>
            </label>

            <label>
              Confirmar contraseña
              <div className="usuarios-input-icon">
                <FiLock />
                <input
                  type="password"
                  name="confirmar_contrasena"
                  placeholder="Repite la contraseña"
                  value={form.confirmar_contrasena}
                  onChange={handleChange}
                />
              </div>
            </label>

            <button type="button" onClick={crearUsuario} disabled={loading}>
              {loading ? "Creando..." : "Crear usuario"}
            </button>
          </div>
        </aside>
      </section>
    </section>
  );
};

export default UsuariosAdmin;