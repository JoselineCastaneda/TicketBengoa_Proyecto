import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiCalendar,
  FiClock,
  FiMapPin,
  FiStar,
  FiMusic,
  FiHeart,
  FiCheckCircle,
  FiChevronRight,
  FiCreditCard,
} from "react-icons/fi";
import { obtenerToken } from "../../auth/auth";
import ClienteNavbar from "../../components/cliente/ClienteNavbar";
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

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [id]);

  const formatearFecha = (fecha) => {
    if (!fecha) {
      return {
        dia: "--",
        mes: "MES",
        anio: "----",
        texto: "Fecha no disponible",
      };
    }

    const fechaObj = new Date(`${fecha.split("T")[0]}T00:00:00`);
    const dia = fechaObj.getDate();
    const mes = fechaObj.toLocaleDateString("es-SV", { month: "long" });
    const anio = fechaObj.getFullYear();

    return {
      dia,
      mes: mes.toUpperCase(),
      anio,
      texto: `${dia} de ${mes} de ${anio}`,
    };
  };

  const formatearHora = (hora) => {
    if (!hora) return "Hora no disponible";

    const partes = hora.split(":");
    const horas = Number(partes[0]);
    const minutos = partes[1] || "00";

    const periodo = horas >= 12 ? "PM" : "AM";
    const hora12 = horas % 12 || 12;

    return `${hora12}:${minutos} ${periodo}`;
  };

  if (loading) {
    return (
      <>
        <ClienteNavbar />

        <main className="detalle-cliente">
          <div className="detalle-message">Cargando evento...</div>
        </main>
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
      </>
    );
  }

  const fecha = formatearFecha(evento.fecha);
  const hora = formatearHora(evento.hora);

  return (
    <>
      <ClienteNavbar />

      <main className="detalle-cliente">
        <section className="detalle-hero-premium">
          <div className="detalle-poster-premium">
            {evento.imagen ? (
              <img src={evento.imagen} alt={evento.nombre_concierto} />
            ) : (
              <div className="detalle-placeholder">Sin imagen</div>
            )}
          </div>

          <div className="detalle-info-premium">
            <p className="detalle-label">Artista</p>
            <p className="detalle-artista">{evento.nombre_artista}</p>

            <h1>{evento.nombre_concierto}</h1>

            <p className="detalle-frase">
              Un concierto lleno de energía, talento y emoción.
            </p>

            <div className="detalle-fecha-hora-grid">
              <div className="detalle-date-card">
                <div className="detalle-card-label">
                  <FiCalendar />
                  <span>Fecha</span>
                </div>

                <div className="detalle-date-body">
                  <strong>{fecha.dia}</strong>

                  <div>
                    <span>{fecha.mes}</span>
                    <small>{fecha.anio}</small>
                  </div>
                </div>
              </div>

              <div className="detalle-date-card">
                <div className="detalle-card-label">
                  <FiClock />
                  <span>Hora</span>
                </div>

                <div className="detalle-hour-body">
                  <strong>{hora.replace(" AM", "").replace(" PM", "")}</strong>
                  <span>{hora.includes("PM") ? "PM" : "AM"}</span>
                </div>
              </div>
            </div>

            <div className="detalle-extra-grid">
              <div className="detalle-mini-card">
                <FiClock />
                <div>
                  <small>Duración del concierto</small>
                  <strong>2h 30m</strong>
                  <span>Aproximadamente</span>
                </div>
              </div>

              <div className="detalle-mini-card detalle-mini-gold">
                <FiStar />
                <div>
                  <small>Género</small>
                  <strong>{evento.genero_musical || "Concierto"} ★ ESTRELLA</strong>
                </div>
              </div>
            </div>

            <button
              className="detalle-main-btn"
              onClick={() =>
                navigate(`/cliente/eventos/${evento.id_concierto}/asientos`)
              }
            >
              <FiCreditCard />
              <span>Seleccionar asientos</span>
              <FiChevronRight />
            </button>
          </div>
        </section>

        <section className="detalle-lugar-card">
          <div className="detalle-lugar-icon">
            <FiMapPin />
          </div>

          <div>
            <small>Lugar</small>
            <h2>El Parque Nacional de Pelota Saturnino Bengoa</h2>
            <p>Está localizado en la ciudad de San Salvador, El Salvador.</p>
          </div>
        </section>

        <section className="detalle-bottom-grid">
          <div className="detalle-section-premium">
            <h2>Descripción del evento</h2>

            <p>{evento.descripcion || "Sin descripción disponible."}</p>

            <div className="detalle-highlights">
              <span>
                <FiMusic />
                Éxitos en vivo
              </span>

              <span>
                <FiStar />
                Producción de nivel mundial
              </span>

              <span>
                <FiHeart />
                Experiencia única
              </span>
            </div>
          </div>

          <div className="detalle-section-premium">
            <h2>Información adicional</h2>

            <ul className="detalle-info-list">
              <li>
                <FiCheckCircle />
                Evento disponible para compra de boletos.
              </li>

              <li>
                <FiCheckCircle />
                Fecha del concierto: {fecha.texto}
              </li>

              <li>
                <FiCheckCircle />
                Hora de inicio: {hora}
              </li>

              <li>
                <FiCheckCircle />
                Duración aproximada: 2h 30m.
              </li>

              <li>
                <FiCheckCircle />
                Consulta disponibilidad antes de comprar.
              </li>
            </ul>
          </div>
        </section>
      </main>
    </>
  );
};

export default DetalleEvento;