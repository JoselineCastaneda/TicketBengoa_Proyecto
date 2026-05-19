import "../../styles/admin/sidebar.css";

import {
  FiGrid,
  FiMic,
  FiCalendar,
  FiMap,
  FiDollarSign,
  FiUsers,
  FiUser,
  FiSettings,
  FiLogOut,
} from "react-icons/fi";

import { useNavigate } from "react-router-dom";
import { cerrarSesion, obtenerUsuarioActivo } from "../../auth/auth";

const SidebarAdmin = ({ setVista, vistaActiva }) => {
  const navigate = useNavigate();
  const usuario = obtenerUsuarioActivo();

  const menuItems = [
    { id: "dashboard", label: "Panel de Control", icon: <FiGrid /> },
    { id: "artistas", label: "Artistas", icon: <FiMic /> },
    { id: "eventos", label: "Eventos", icon: <FiCalendar /> },
    { id: "zonas", label: "Zonas por Evento", icon: <FiMap /> },
    { id: "ventas", label: "Historial de Ventas", icon: <FiDollarSign /> },
    { id: "usuarios", label: "Gestión de Usuarios", icon: <FiUsers /> },
    { id: "clientes", label: "Clientes", icon: <FiUser /> },
    { id: "config", label: "Configuración", icon: <FiSettings /> },
  ];

  const nombreUsuario = usuario?.nombre
    ? `${usuario.nombre} ${usuario.apellido || ""}`.trim()
    : "Administrador";

  const inicialUsuario = usuario?.nombre
    ? usuario.nombre.charAt(0).toUpperCase()
    : "A";

  const rolUsuario = usuario?.rol || "Administrador";

  const handleCambiarVista = (vista) => {
    setVista(vista);
  };

  const handleLogout = () => {
    cerrarSesion();
    navigate("/login");
  };

  return (
    <aside className="sidebar-admin">
      <div className="sidebar-brand">
        <div className="sidebar-brand-glow" />

        <div className="sidebar-brand-content">
          <h2 className="sidebar-brand-title">
            Ticket<span>Bengoa</span>
          </h2>

          <div className="sidebar-brand-divider" />

          <p className="sidebar-brand-subtitle">Admin Panel</p>
        </div>
      </div>

      <nav className="sidebar-menu">
        {menuItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => handleCambiarVista(item.id)}
            className={`sidebar-item ${
              vistaActiva === item.id ? "active" : ""
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-user-box">
        <div className="sidebar-user-top">
          <div className="sidebar-user-avatar">{inicialUsuario}</div>

          <div className="sidebar-user-info">
            <strong>{nombreUsuario}</strong>
            <span>{rolUsuario}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="sidebar-logout-btn"
        >
          <FiLogOut />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
};

export default SidebarAdmin;