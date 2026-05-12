import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { obtenerToken } from "../../auth/auth";
import ClienteNavbar from "../../components/cliente/ClienteNavbar";
import ClienteFooter from "../../components/cliente/ClienteFooter";
import "../../styles/cliente/detalleEvento.css";

const API_URL = "http://localhost:3000/api";

const DetalleEvento = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [evento, setEvento] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const token = obtenerToken();

  useEffect(() => {
    const obtenerDetalleEvento = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(`${API_URL}/cliente/eventos/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!data.ok) {
          setError(data.mensaje || "No se pudo cargar el evento");
          return;
        }

        setEvento(data.evento);
      } catch (error) {
        setError("Error de conexión al cargar el evento");
      } finally {
        setLoading(false);
      }
    };

    obtenerDetalleEvento();
  }, [id, token]);

  if (loading) {
    return (
      <>
        <ClienteNavbar />
        <main className="detalle-cliente">
          <div className="detalle-message">Cargando evento...</div>
        </main>
        <ClienteFooter />
      </>
    );
  }

  if (error || !evento) {
    return (
      <>
        <ClienteNavbar />
        <main className="detalle-cliente">
          <div className="detalle-error">
            {error || "Evento no encontrado."}
          </div>
        </main>
        <ClienteFooter />
      </>
    );
  }

  return (
    <>
      <ClienteNavbar />

      <main className="detalle-cliente">
        <section className="detalle-hero-simple">
          <div className="detalle-poster-simple">
            {evento.imagen ? (
              <img src={evento.imagen} alt={evento.nombre_concierto} />
            ) : (
              <div className="detalle-placeholder">Sin imagen</div>
            )}
          </div>

          <div className="detalle-info-simple">
            <span className="detalle-badge">Disponible</span>

            <h1>{evento.nombre_concierto}</h1>

            <p className="detalle-artista">{evento.nombre_artista}</p>

            <div className="detalle-data">
              <p>
                <strong>Fecha:</strong> {evento.fecha?.split("T")[0]}
              </p>

              <p>
                <strong>Hora:</strong> {evento.hora}
              </p>
            </div>

            <p className="detalle-descripcion">
              {evento.descripcion || "Sin descripción disponible."}
            </p>

            <button
              className="detalle-main-btn"
              onClick={() =>
                navigate(`/cliente/eventos/${evento.id_concierto}/asientos`)
              }
            >
              Seleccionar asientos
            </button>
          </div>
        </section>

        <section className="detalle-section-simple">
          <h2>Descripción del evento</h2>
          <p>{evento.descripcion || "Sin descripción disponible."}</p>
        </section>

        <section className="detalle-section-simple">
          <h2>Información adicional</h2>

          <ul>
            <li>Evento disponible para compra de boletos.</li>
            <li>Fecha del concierto: {evento.fecha?.split("T")[0]}</li>
            <li>Hora de inicio: {evento.hora}</li>
            <li>Consulta disponibilidad antes de comprar.</li>
          </ul>
        </section>
      </main>

      <ClienteFooter />
    </>
  );
};

export default DetalleEvento;