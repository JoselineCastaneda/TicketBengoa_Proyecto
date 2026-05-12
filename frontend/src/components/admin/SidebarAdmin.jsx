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
import { cerrarSesion } from "../../auth/auth";

const SidebarAdmin = ({ setVista, vistaActiva }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    cerrarSesion();
    navigate("/login");
  };

  return (
    <aside className="sidebar-admin">
      <div className="sidebar-logo">
        <span className="sidebar-logo-mark">TB</span>
        <span>TicketBengoa</span>
      </div>

      <nav className="sidebar-menu">
        <button
          onClick={() => setVista("dashboard")}
          className={`sidebar-item ${vistaActiva === "dashboard" ? "active" : ""}`}
        >
          <FiGrid />
          <span>Panel de Control</span>
        </button>

        <button
          onClick={() => setVista("artistas")}
          className={`sidebar-item ${vistaActiva === "artistas" ? "active" : ""}`}
        >
          <FiMic />
          <span>Artistas</span>
        </button>

        <button
          onClick={() => setVista("eventos")}
          className={`sidebar-item ${vistaActiva === "eventos" ? "active" : ""}`}
        >
          <FiCalendar />
          <span>Eventos</span>
        </button>

        <button
          onClick={() => setVista("zonas")}
          className={`sidebar-item ${vistaActiva === "zonas" ? "active" : ""}`}
        >
          <FiMap />
          <span>Zonas por Evento</span>
        </button>

        <button
          onClick={() => setVista("ventas")}
          className={`sidebar-item ${vistaActiva === "ventas" ? "active" : ""}`}
        >
          <FiDollarSign />
          <span>Historial de Ventas</span>
        </button>

        <button
          onClick={() => setVista("usuarios")}
          className={`sidebar-item ${vistaActiva === "usuarios" ? "active" : ""}`}
        >
          <FiUsers />
          <span>Gestión de Usuarios</span>
        </button>

        <button
          onClick={() => setVista("clientes")}
          className={`sidebar-item ${vistaActiva === "clientes" ? "active" : ""}`}
        >
          <FiUser />
          <span>Clientes</span>
        </button>

        <button
          onClick={() => setVista("config")}
          className={`sidebar-item ${vistaActiva === "config" ? "active" : ""}`}
        >
          <FiSettings />
          <span>Configuración</span>
        </button>
      </nav>

      <button onClick={handleLogout} className="sidebar-item logout-btn">
        <FiLogOut />
        <span>Cerrar Sesión</span>
      </button>
    </aside>
  );
};

export default SidebarAdmin;