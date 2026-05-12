import { useState } from "react";
import LayoutAdmin from "../../components/admin/LayoutAdmin";
import SidebarAdmin from "../../components/admin/SidebarAdmin";
import ArtistasAdmin from "../../components/admin/ArtistasAdmin";
import EventosAdmin from "../../components/admin/EventosAdmin";
import ZonasAdmin from "../../components/admin/ZonasAdmin";
import UsuariosAdmin from "../../components/admin/UsuariosAdmin";

const Admin = () => {
  const [vista, setVista] = useState("dashboard");

  return (
    <LayoutAdmin>
      <SidebarAdmin setVista={setVista} vistaActiva={vista} />

      <main className="admin-content">
        {vista === "dashboard" && <h1>Panel de Control</h1>}
        {vista === "artistas" && <ArtistasAdmin />}
        {vista === "eventos" && <EventosAdmin />}
        {vista === "zonas" && <ZonasAdmin />}
        {vista === "ventas" && <h1>Historial de Ventas</h1>}
        {vista === "usuarios" && <UsuariosAdmin />}
        {vista === "clientes" && <h1>Clientes</h1>}
        {vista === "config" && <h1>Configuración</h1>}
      </main>
    </LayoutAdmin>
  );
};

export default Admin;