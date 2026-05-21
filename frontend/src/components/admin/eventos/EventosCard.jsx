import {
  FiCalendar,
  FiClock,
  FiEdit2,
  FiImage,
  FiTrash2,
} from "react-icons/fi";

const EventosCard = ({ evento, onEditar, onEliminar }) => {
  return (
    <article className="evento-card">
      <div className="evento-img-box">
        {evento.imagen ? (
          <img src={evento.imagen} alt={evento.nombre_concierto} />
        ) : (
          <div className="evento-img-placeholder">
            <FiImage />
            <span>Sin imagen</span>
          </div>
        )}
      </div>

      <div className="evento-card-body">
        <span className={`estado-badge estado-${evento.estado}`}>
          {evento.estado}
        </span>

        <h3>{evento.nombre_concierto}</h3>

        <p>
          <strong>Artista:</strong> {evento.nombre_artista}
        </p>

        <div className="evento-meta">
          <span>
            <FiCalendar />
            {evento.fecha?.split("T")[0]}
          </span>

          <span>
            <FiClock />
            {evento.hora}
          </span>
        </div>

        <div className="eventos-card-actions">
          <button
            type="button"
            className="eventos-action-btn edit"
            onClick={() => onEditar(evento)}
          >
            <FiEdit2 />
            Editar
          </button>

          <button
            type="button"
            className="eventos-action-btn delete"
            onClick={() => onEliminar(evento.id_concierto)}
          >
            <FiTrash2 />
            Eliminar
          </button>
        </div>
      </div>
    </article>
  );
};

export default EventosCard;