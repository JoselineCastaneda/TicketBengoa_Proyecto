import { useState } from "react";
import { FiMenu,} from "react-icons/fi";

import SidebarAdmin from "./SidebarAdmin";

import "../../styles/admin/admin.css";

const LayoutAdmin = ({
  children,
  setVista,
  vistaActiva,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleCambiarVista = (vista) => {
    setVista(vista);
    setSidebarOpen(false);
  };

  return (
    <div className="admin-layout">
      {/* BOTÓN MENÚ MOBILE */}
      <button
        type="button"
        className="admin-menu-btn"
        onClick={() => setSidebarOpen(true)}
      >
        <FiMenu />
      </button>

      {/* OVERLAY */}
      <div
        className={`admin-sidebar-overlay ${
          sidebarOpen ? "active" : ""
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* SIDEBAR */}
      <div
        className={`admin-sidebar-wrapper ${
          sidebarOpen ? "active" : ""
        }`}
      >


        <SidebarAdmin
          setVista={handleCambiarVista}
          vistaActiva={vistaActiva}
        />
      </div>

      {/* CONTENIDO */}
      <main className="admin-content">
        {children}
      </main>
    </div>
  );
};

export default LayoutAdmin;