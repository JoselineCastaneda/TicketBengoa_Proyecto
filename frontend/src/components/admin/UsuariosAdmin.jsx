import { useEffect, useState } from "react";
import { obtenerToken } from "../../auth/auth";
import "../../styles/admin/usuarios.css";

const API_URL = "http://localhost:3000/api";

const UsuariosAdmin = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroRol, setFiltroRol] = useState("todos");
  const [filtroEstado, setFiltroEstado] = useState("todos");

  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    correo_electronico: "",
    contrasena: "",
    rol: "validador",
  });

  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const token = obtenerToken();

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
    } catch (error) {
      setError("Error al cargar usuarios");
    }
  };

  useEffect(() => {
    obtenerUsuarios();
  }, []);

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
      !form.rol
    ) {
      setError("Todos los campos son obligatorios");
      return;
    }

    if (form.contrasena.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/usuarios`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!data.ok) {
        setError(data.mensaje || "Error al crear usuario");
        return;
      }

      setMensaje("Usuario creado correctamente");
      limpiarFormulario();
      obtenerUsuarios();
    } catch (error) {
      setError("Error al crear usuario");
    } finally {
      setLoading(false);
    }
  };

  const cambiarEstado = async (id_usuario, estado) => {
    setMensaje("");
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/usuarios/${id_usuario}/estado`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ estado }),
        }
      );

      const data = await response.json();

      if (!data.ok) {
        setError(data.mensaje || "Error al actualizar estado");
        return;
      }

      setMensaje("Estado actualizado correctamente");
      obtenerUsuarios();
    } catch (error) {
      setError("Error al actualizar estado");
    }
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

    const coincideRol =
      filtroRol === "todos" || usuario.rol === filtroRol;

    const coincideEstado =
      filtroEstado === "todos" || usuario.estado === filtroEstado;

    return coincideBusqueda && coincideRol && coincideEstado;
  });

  return (
    <div>
      <h1 className="admin-page-title">Gestión de Usuarios</h1>

      <div className="usuarios-toolbar">
        <input
          type="text"
          placeholder="Buscar por nombre, correo, rol o estado..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />

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

        <span>Total: {usuariosFiltrados.length}</span>
      </div>

      {mensaje && <p className="admin-success">{mensaje}</p>}
      {error && <p className="admin-error">{error}</p>}

      <div className="usuarios-form">
        <input
          type="text"
          name="nombre"
          placeholder="Nombre"
          value={form.nombre}
          onChange={handleChange}
        />

        <input
          type="text"
          name="apellido"
          placeholder="Apellido"
          value={form.apellido}
          onChange={handleChange}
        />

        <input
          type="email"
          name="correo_electronico"
          placeholder="Correo electrónico"
          value={form.correo_electronico}
          onChange={handleChange}
        />

        <input
          type="password"
          name="contrasena"
          placeholder="Contraseña"
          value={form.contrasena}
          onChange={handleChange}
        />

        <select name="rol" value={form.rol} onChange={handleChange}>
          <option value="validador">Validador</option>
          <option value="administrador">Administrador</option>
        </select>

        <button onClick={crearUsuario} disabled={loading}>
          {loading ? "Creando..." : "Crear usuario"}
        </button>
      </div>

      <div className="usuarios-table-card">
        <table className="usuarios-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Usuario</th>
              <th>Correo</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Fecha registro</th>
              <th>Acción</th>
            </tr>
          </thead>

          <tbody>
            {usuariosFiltrados.map((usuario) => (
              <tr key={usuario.id_usuario}>
                <td>{usuario.id_usuario}</td>

                <td>
                  {usuario.nombre} {usuario.apellido}
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
                    onChange={(e) =>
                      cambiarEstado(usuario.id_usuario, e.target.value)
                    }
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
                <td colSpan="7" className="tabla-vacia">
                  No hay usuarios que coincidan con la búsqueda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsuariosAdmin;