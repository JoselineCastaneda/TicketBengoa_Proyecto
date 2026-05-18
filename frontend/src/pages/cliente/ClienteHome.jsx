import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { obtenerToken } from "../../auth/auth";
import ClienteNavbar from "../../components/cliente/ClienteNavbar";
import ClienteFooter from "../../components/cliente/ClienteFooter";
import "../../styles/cliente/cliente.css";

const API_URL = "http://localhost:3000/api";

const ClienteHome = () => {
  const navigate = useNavigate();

  const [eventos, setEventos] = useState([]);
  const [indiceActual, setIndiceActual] = useState(0);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [indiceSugerencia, setIndiceSugerencia] = useState(-1);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const token = obtenerToken();

  const obtenerEventos = async () => {
    try {
      const response = await fetch(`${API_URL}/cliente/eventos`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!data.ok) {
        setError(data.mensaje || "Error al cargar eventos");
        return;
      }

      setEventos(data.eventos);

      if (data.eventos.length === 0) {
        setMensaje("No hay eventos disponibles por el momento.");
      }
    } catch (error) {
      setError("Error de conexión al cargar eventos.");
    }
  };

  useEffect(() => {
    obtenerEventos();
  }, []);

  const siguienteEvento = () => {
    if (eventos.length === 0) return;
    setIndiceActual((prev) => (prev + 1) % eventos.length);
  };

  const anteriorEvento = () => {
    if (eventos.length === 0) return;
    setIndiceActual((prev) => (prev - 1 + eventos.length) % eventos.length);
  };

  const eventoDestacado = eventos[indiceActual];
  const eventosProximos = eventos.slice(0, 3);

  const sugerencias = busqueda.trim()
    ? eventos.filter((evento) => {
        const texto = `
          ${evento.nombre_concierto || ""}
          ${evento.nombre_artista || ""}
          ${evento.descripcion || ""}
        `.toLowerCase();

        return texto.includes(busqueda.toLowerCase());
      })
    : [];

  const seleccionarSugerencia = (evento) => {
    setBusqueda(evento.nombre_concierto);
    setMostrarSugerencias(false);
    setIndiceSugerencia(-1);
    navigate(`/cliente/eventos/${evento.id_concierto}`);
  };

  const buscarEvento = () => {
    if (indiceSugerencia >= 0 && sugerencias[indiceSugerencia]) {
      navigate(`/cliente/eventos/${sugerencias[indiceSugerencia].id_concierto}`);
      return;
    }

    if (sugerencias.length > 0) {
      navigate(`/cliente/eventos/${sugerencias[0].id_concierto}`);
    }
  };

  const manejarTeclas = (e) => {
    if (!mostrarSugerencias || sugerencias.length === 0) {
      if (e.key === "Enter") {
        e.preventDefault();
        buscarEvento();
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIndiceSugerencia((prev) =>
        prev < sugerencias.length - 1 ? prev + 1 : 0
      );
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setIndiceSugerencia((prev) =>
        prev > 0 ? prev - 1 : sugerencias.length - 1
      );
    }

    if (e.key === "Enter") {
      e.preventDefault();

      if (indiceSugerencia >= 0 && sugerencias[indiceSugerencia]) {
        seleccionarSugerencia(sugerencias[indiceSugerencia]);
      } else {
        buscarEvento();
      }
    }
  };

  return (
    <>
      <ClienteNavbar />

      <main className="cliente-home">
        <section className="cliente-hero">
          <h1>Encuentra tu próximo concierto</h1>
          <p>Busca artistas, conciertos y eventos disponibles en TicketBengoa.</p>

          <div className="cliente-search-wrapper">
            <div className="cliente-search-box">
              <input
                type="text"
                placeholder="Buscar artista, concierto o evento"
                value={busqueda}
                onChange={(e) => {
                  setBusqueda(e.target.value);
                  setMostrarSugerencias(true);
                  setIndiceSugerencia(-1);
                }}
                onFocus={() => setMostrarSugerencias(true)}
                onKeyDown={manejarTeclas}
              />

              
            </div>

            {mostrarSugerencias && sugerencias.length > 0 && (
              <div className="cliente-suggestions">
                {sugerencias.map((evento, index) => (
                  <div
                    key={evento.id_concierto}
                    className={`cliente-suggestion-item ${
                      indiceSugerencia === index
                        ? "cliente-suggestion-item-active"
                        : ""
                    }`}
                    onClick={() => seleccionarSugerencia(evento)}
                  >
                    <strong>{evento.nombre_concierto}</strong>
                    <span>{evento.nombre_artista}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {mensaje && <div className="cliente-info">{mensaje}</div>}
        {error && <div className="cliente-error">{error}</div>}

        {eventoDestacado && (
          <section className="cliente-destacado-section">
            <h2>Evento destacado</h2>

            <div className="cliente-destacado">
              <button className="cliente-arrow" onClick={anteriorEvento}>
                ❮
              </button>

              <div className="cliente-destacado-card">
                <div className="cliente-destacado-img">
                  {eventoDestacado.imagen ? (
                    <img
                      src={eventoDestacado.imagen}
                      alt={eventoDestacado.nombre_concierto}
                    />
                  ) : (
                    <div className="cliente-img-placeholder">Sin imagen</div>
                  )}
                </div>

                <div className="cliente-destacado-content">
                  <h3>{eventoDestacado.nombre_concierto}</h3>

                  <p>
                    <strong>Artista:</strong> {eventoDestacado.nombre_artista}
                  </p>

                  <p>
                    <strong>Fecha:</strong> {eventoDestacado.fecha?.split("T")[0]}
                  </p>

                  <p>
                    <strong>Hora:</strong> {eventoDestacado.hora}
                  </p>

                  {eventoDestacado.descripcion && (
                    <p className="cliente-desc">{eventoDestacado.descripcion}</p>
                  )}

                  <button
                    className="cliente-main-btn"
                    onClick={() =>
                      navigate(`/cliente/eventos/${eventoDestacado.id_concierto}`)
                    }
                  >
                    Ver detalles
                  </button>
                </div>
              </div>

              <button className="cliente-arrow" onClick={siguienteEvento}>
                ❯
              </button>
            </div>
          </section>
        )}

        <section className="cliente-proximos">
          <h2>Eventos próximos</h2>

          <div className="cliente-eventos-grid">
            {eventosProximos.map((evento) => (
              <article className="cliente-evento-card" key={evento.id_concierto}>
                <div className="cliente-evento-img">
                  {evento.imagen ? (
                    <img
                      src={evento.imagen}
                      alt={evento.nombre_concierto}
                      className={
                        evento.nombre_artista?.toLowerCase().includes("ariana")
                          ? "evento-img-ariana"
                          : "evento-img-normal"
                      }
                    />
                  ) : (
                    <div className="cliente-img-placeholder">Sin imagen</div>
                  )}
                </div>

                <div className="cliente-evento-body">
                  <h3>{evento.nombre_concierto}</h3>

                  <p>
                    <strong>Artista:</strong> {evento.nombre_artista}
                  </p>

                  <p>
                    <strong>Fecha:</strong> {evento.fecha?.split("T")[0]}
                  </p>

                  <p>
                    <strong>Hora:</strong> {evento.hora}
                  </p>

                  <button
                    className="cliente-btn"
                    onClick={() =>
                      navigate(`/cliente/eventos/${evento.id_concierto}`)
                    }
                  >
                    Ver detalles
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <ClienteFooter />
    </>
  );
};

export default ClienteHome;