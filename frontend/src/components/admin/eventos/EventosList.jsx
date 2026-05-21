import { FiSearch } from "react-icons/fi";
import EventosCard from "./EventosCard";

const EventosList = ({
  eventos,
  busqueda,
  setBusqueda,
  filtro,
  setFiltro,
  onEditar,
  onEliminar,
}) => {
  return (
    <section className="eventos-list-card">
      <div className="eventos-list-header">
        <div className="eventos-card-title">
          <span></span>
          <h2>Eventos registrados</h2>
        </div>

        <div className="eventos-toolbar">
          <div className="eventos-search-box">
            <FiSearch />

            <input
              type="text"
              placeholder="Buscar por nombre, artista o estado..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <select
            className="eventos-filter"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          >
            <option value="todos">Todos los estados</option>
            <option value="borrador">Borradores</option>
            <option value="activo">Activos</option>
            <option value="cancelado">Cancelados</option>
            <option value="finalizado">Finalizados</option>
            <option value="pospuesto">Pospuestos</option>
          </select>
        </div>
      </div>

      <div className="eventos-grid">
        {eventos.map((evento) => (
          <EventosCard
            key={evento.id_concierto}
            evento={evento}
            onEditar={onEditar}
            onEliminar={onEliminar}
          />
        ))}

        {eventos.length === 0 && (
          <div className="eventos-empty">
            No hay eventos registrados.
          </div>
        )}
      </div>
    </section>
  );
};

export default EventosList;