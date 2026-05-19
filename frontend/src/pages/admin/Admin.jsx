import { useState } from "react";

import LayoutAdmin from "../../components/admin/LayoutAdmin";

import ArtistasAdmin from "../../components/admin/ArtistasAdmin";
import EventosAdmin from "../../components/admin/EventosAdmin";
import ZonasAdmin from "../../components/admin/ZonasAdmin";
import UsuariosAdmin from "../../components/admin/UsuariosAdmin";

const Admin = () => {
  const [vista, setVista] = useState("dashboard");

  const renderVista = () => {
    switch (vista) {
      case "dashboard":
        return <h1 className="admin-page-title">Panel de Control</h1>;

      case "artistas":
        return <ArtistasAdmin />;

      case "eventos":
        return <EventosAdmin />;

      case "zonas":
        return <ZonasAdmin />;

      case "ventas":
        return (
          <h1 className="admin-page-title">
            Historial de Ventas
          </h1>
        );

      case "usuarios":
        return <UsuariosAdmin />;

      case "clientes":
        return (
          <h1 className="admin-page-title">
            Clientes
          </h1>
        );

      case "config":
        return (
          <h1 className="admin-page-title">
            Configuración
          </h1>
        );

      default:
        return <h1 className="admin-page-title">Panel de Control</h1>;
    }
  };

  return (
    <LayoutAdmin
      setVista={setVista}
      vistaActiva={vista}
    >
      {renderVista()}
    </LayoutAdmin>
  );
};

export default Admin;