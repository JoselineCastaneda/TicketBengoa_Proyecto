import { useState } from "react";
import "../../styles/admin/historialVentas.css";

import LayoutAdmin from "../../components/admin/LayoutAdmin";

import DashboardAdmin from "./DashboardAdmin";
import ArtistasAdmin from "../../components/admin/ArtistasAdmin";
import EventosAdmin from "../../components/admin/EventosAdmin";
import ZonasAdmin from "../../components/admin/ZonasAdmin";
import UsuariosAdmin from "../../components/admin/UsuariosAdmin";
import HistorialVentasAdmin from "./HistorialVentasAdmin";


const Admin = () => {
  const [vista, setVista] = useState("dashboard");

  const renderVista = () => {
    switch (vista) {
      case "dashboard":
        return <DashboardAdmin />;

      case "artistas":
        return <ArtistasAdmin />;

      case "eventos":
        return <EventosAdmin />;

      case "zonas":
        return <ZonasAdmin />;

      case "ventas":
        return <HistorialVentasAdmin />;

      case "usuarios":
        return <UsuariosAdmin />;

      case "clientes":
        return <h1 className="admin-page-title">Clientes</h1>;

      case "config":
        return <h1 className="admin-page-title">Configuración</h1>;

      default:
        return <DashboardAdmin />;
    }
  };

  return (
    <LayoutAdmin setVista={setVista} vistaActiva={vista}>
      {renderVista()}
    </LayoutAdmin>
  );
};

export default Admin;