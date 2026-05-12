import { useEffect, useState } from "react";
import { obtenerToken } from "../../auth/auth";
import "../../styles/admin/zonas.css";

const API_URL = "http://localhost:3000/api";

const ZonasAdmin = () => {
  const [eventos, setEventos] = useState([]);
  const [zonas, setZonas] = useState([]);
  const [eventoSeleccionado, setEventoSeleccionado] = useState("");
  const [eventoInfo, setEventoInfo] = useState(null);

  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const [guardandoId, setGuardandoId] = useState(null);
  const [inicializando, setInicializando] = useState(false);
  const [loading, setLoading] = useState(false);

  const token = obtenerToken();

  const obtenerEventos = async () => {
    try {
      const response = await fetch(`${API_URL}/conciertos`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.ok) {
        setEventos(data.conciertos);
      }
    } catch (error) {
      setError("Error al cargar eventos");
    }
  };

  const obtenerZonas = async (idConcierto) => {
    if (!idConcierto) {
      setZonas([]);
      setEventoInfo(null);
      return;
    }

    setLoading(true);
    setMensaje("");
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/zonas/concierto/${idConcierto}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!data.ok) {
        setError(data.mensaje || "Error al cargar zonas");
        return;
      }

      setEventoInfo(data.evento);
      setZonas(data.zonas);
    } catch (error) {
      setError("Error al cargar zonas del evento");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    obtenerEventos();
  }, []);

  const handleEventoChange = (e) => {
    const id = e.target.value;

    setEventoSeleccionado(id);
    obtenerZonas(id);
  };

  const cambiarPrecio = (idZona, nuevoPrecio) => {
    if (Number(nuevoPrecio) < 0) {
      setError("El precio no puede ser negativo");
      return;
    }

    setError("");

    setZonas((prevZonas) =>
      prevZonas.map((zona) =>
        zona.id_zona === idZona
          ? { ...zona, precio_zona: nuevoPrecio }
          : zona
      )
  );
};

  const actualizarPrecioZona = async (zona) => {
    setMensaje("");
    setError("");
    setGuardandoId(zona.id_zona);

    try {
      const response = await fetch(`${API_URL}/zonas/${zona.id_zona}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          precio_zona: zona.precio_zona,
        }),
      });

      const data = await response.json();

      if (!data.ok) {
        setError(data.mensaje || "Error al actualizar precio");
        return;
      }

      setMensaje(`Precio actualizado para ${zona.nombre_zona}`);

      obtenerZonas(eventoSeleccionado);
    } catch (error) {
      setError("Error al actualizar precio");
    } finally {
      setGuardandoId(null);
    }
  };

  const inicializarZonas = async () => {
    setInicializando(true);
    setMensaje("");
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/zonas/inicializar/${eventoSeleccionado}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!data.ok) {
        setError(data.mensaje || "Error al inicializar zonas");
        return;
      }

      setMensaje("Zonas y asientos creados correctamente");

      obtenerZonas(eventoSeleccionado);
    } catch (error) {
      setError("Error al inicializar zonas");
    } finally {
      setInicializando(false);
    }
  };

  const puedeEditar = eventoInfo?.estado === "borrador";

  const totalAsientos = zonas.reduce(
    (acc, zona) => acc + Number(zona.total_asientos),
    0
  );

  return (
    <div>
      <h1 className="admin-page-title">Zonas por Evento</h1>

      <div className="zonas-header-card">
        <div>
          <label className="zonas-label">
            Seleccionar evento
          </label>

          <select
            className="zonas-select"
            value={eventoSeleccionado}
            onChange={handleEventoChange}
          >
            <option value="">
              Seleccione un evento
            </option>

            {eventos.map((evento) => (
              <option
                key={evento.id_concierto}
                value={evento.id_concierto}
              >
                {evento.nombre_concierto} - {evento.nombre_artista}
              </option>
            ))}
          </select>
        </div>

        {eventoInfo && (
          <div className="zonas-evento-info">
            <p>
              <strong>Evento:</strong>{" "}
              {eventoInfo.nombre_concierto}
            </p>

            <span
              className={`estado-badge estado-${eventoInfo.estado}`}
            >
              {eventoInfo.estado}
            </span>
          </div>
        )}
      </div>

      {mensaje && (
        <p className="admin-success">{mensaje}</p>
      )}

      {error && (
        <p className="admin-error">{error}</p>
      )}

      {eventoInfo && !puedeEditar && (
        <div className="zonas-warning">
          Este evento ya no está en borrador.
          Los precios están bloqueados.
        </div>
      )}

      {!eventoSeleccionado && (
        <div className="zonas-empty">
          Selecciona un evento para administrar
          sus zonas y precios.
        </div>
      )}

      {loading && (
        <div className="zonas-empty">
          Cargando zonas...
        </div>
      )}

      {eventoSeleccionado &&
        !loading &&
        zonas.length === 0 && (
          <div className="zonas-empty">
            <h3>
              Este evento todavía no tiene zonas
            </h3>

            <p>
              Inicializa automáticamente las zonas,
              capacidades y asientos del estadio.
            </p>

            <button
              className="zonas-init-btn"
              onClick={inicializarZonas}
              disabled={inicializando}
            >
              {inicializando
                ? "Inicializando..."
                : "Inicializar zonas y asientos"}
            </button>
          </div>
        )}

      {zonas.length > 0 && (
        <>
          <div className="zonas-resumen">
            <div className="zonas-resumen-card">
              <small>Total zonas</small>
              <strong>{zonas.length}</strong>
            </div>

            <div className="zonas-resumen-card">
              <small>Total asientos</small>
              <strong>{totalAsientos}</strong>
            </div>

            <div className="zonas-resumen-card">
              <small>Evento</small>
              <strong>{eventoInfo?.estado}</strong>
            </div>
          </div>

          <div className="zonas-grid">
            {zonas.map((zona) => (
              <div
                className="zona-card"
                key={zona.id_zona}
              >
                <div className="zona-card-header">
                  <h3>{zona.nombre_zona}</h3>

                  <span>
                    ID {zona.id_zona}
                  </span>
                </div>

                <p className="zona-desc">
                  {zona.descripcion_zona}
                </p>

                <div className="zona-stats">
                  <div>
                    <small>Capacidad</small>

                    <strong>
                      {zona.capacidad_zona}
                    </strong>
                  </div>

                  <div>
                    <small>
                      Asientos registrados
                    </small>

                    <strong>
                      {zona.total_asientos}
                    </strong>
                  </div>
                </div>

                <label className="zonas-label">
                  Precio de zona
                </label>

                <input
                  className="zona-precio-input"
                  type="number"
                  min="0"
                  step="0.01"
                  value={zona.precio_zona}
                  disabled={!puedeEditar}
                  onChange={(e) =>
                    cambiarPrecio(
                      zona.id_zona,
                      e.target.value
                    )
                  }
                />

                <button
                  className="zona-save-btn"
                  disabled={
                    !puedeEditar ||
                    guardandoId === zona.id_zona
                  }
                  onClick={() =>
                    actualizarPrecioZona(zona)
                  }
                >
                  {guardandoId === zona.id_zona
                    ? "Guardando..."
                    : "Guardar precio"}
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ZonasAdmin;