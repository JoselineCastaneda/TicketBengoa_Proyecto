import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { cerrarSesion } from "../../auth/auth";
import "../../styles/cliente/cliente.css";

const ClienteNavbar = () => {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const navigate = useNavigate();

  const cerrarMenu = () => setMenuAbierto(false);

  const handleLogout = () => {
    cerrarSesion();
    navigate("/login");
  };

  return (
    <>
      <header className="cliente-navbar">
        <button
          className="cliente-navbar-toggle"
          onClick={() => setMenuAbierto(!menuAbierto)}
        >
          ☰
        </button>

        <Link to="/cliente" className="cliente-navbar-logo">
          TicketBengoa
        </Link>

        <nav className="cliente-navbar-menu">
          <Link to="/cliente">Inicio</Link>
          <Link to="/cliente">Eventos</Link>
          <Link to="/cliente/mis-boletos">Mis boletos</Link>
        </nav>

        <div className="cliente-navbar-user">
          <Link to="/cliente/perfil" className="cliente-profile-link">
            Mi perfil
          </Link>

          <button onClick={handleLogout}>Salir</button>
        </div>
      </header>

      {menuAbierto && (
        <>
          <div className="cliente-sidebar-overlay" onClick={cerrarMenu}></div>

          <aside className="cliente-sidebar">
            <div className="cliente-sidebar-header">
              <Link
                to="/cliente"
                className="cliente-sidebar-logo"
                onClick={cerrarMenu}
              >
                TicketBengoa
              </Link>

              <button onClick={cerrarMenu}>✕</button>
            </div>

            <nav className="cliente-sidebar-menu">
              <Link to="/cliente" onClick={cerrarMenu}>
                Inicio
              </Link>

              <Link to="/cliente" onClick={cerrarMenu}>
                Eventos
              </Link>

              <Link to="/cliente/mis-boletos" onClick={cerrarMenu}>
                Mis boletos
              </Link>

              <Link to="/cliente/perfil" onClick={cerrarMenu}>
                Mi perfil
              </Link>

              <button onClick={handleLogout}>Cerrar sesión</button>
            </nav>
          </aside>
        </>
      )}
    </>
  );
};

export default ClienteNavbar;