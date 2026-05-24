import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  FiLogOut,
  FiUser,
  FiMenu,
  FiX,
  FiCreditCard,
  FiHome,
  FiCalendar,
} from "react-icons/fi";
import { cerrarSesion } from "../../auth/auth";
import "../../styles/cliente/cliente.css";

const ClienteNavbar = () => {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const navigate = useNavigate();

  const usuario = JSON.parse(localStorage.getItem("usuarioActivo")) || null;

  const cerrarMenu = () => setMenuAbierto(false);

  const handleLogout = () => {
    cerrarSesion();
    navigate("/login");
  };

  const inicialUsuario = usuario?.nombre
    ? usuario.nombre.charAt(0).toUpperCase()
    : "C";

  const nombreUsuario = usuario?.nombre || "Cliente";

  return (
    <>
      <header className="cliente-navbar">
        <Link to="/cliente" className="cliente-navbar-logo">
          Ticket<span>Bengoa</span>
        </Link>

        <nav className="cliente-navbar-menu">
          <Link to="/cliente" className="cliente-nav-link active">
            <FiHome />
            <span>Inicio</span>
          </Link>

          <Link to="/cliente" className="cliente-nav-link">
            <FiCalendar />
            <span>Eventos</span>
          </Link>

          <Link
            to="/cliente/mis-boletos"
            className="cliente-nav-link"
          >
            <FiCreditCard />
            <span>Mis boletos</span>
          </Link>
        </nav>

        <div className="cliente-navbar-user">
          <Link to="/cliente" className="cliente-profile-box">
            <span className="cliente-profile-avatar">{inicialUsuario}</span>

            <span className="cliente-profile-text">
              <FiUser />
              {nombreUsuario}
            </span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="cliente-logout-btn"
          >
            <FiLogOut />
            <span>Cerrar sesión</span>
          </button>
        </div>

        <button
          type="button"
          className="cliente-navbar-toggle"
          onClick={() => setMenuAbierto(!menuAbierto)}
        >
          <FiMenu />
        </button>
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
                Ticket<span>Bengoa</span>
              </Link>

              <button type="button" onClick={cerrarMenu}>
                <FiX />
              </button>
            </div>

            <nav className="cliente-sidebar-menu">
              <Link to="/cliente" onClick={cerrarMenu} className="active">
                <FiHome />
                <span>Inicio</span>
              </Link>

              <Link to="/cliente" onClick={cerrarMenu}>
                <FiCalendar />
                <span>Eventos</span>
              </Link>

              <Link
                to="/cliente/mis-boletos"
                onClick={cerrarMenu}
              >
                <FiCreditCard />
                <span>Mis boletos</span>
              </Link>
            </nav>

            <div className="cliente-sidebar-user">
              <div className="cliente-profile-avatar">{inicialUsuario}</div>
              <strong>{nombreUsuario}</strong>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="cliente-sidebar-logout-btn"
            >
              <FiLogOut />
              <span>Cerrar sesión</span>
            </button>
          </aside>
        </>
      )}
    </>
  );
};

export default ClienteNavbar;