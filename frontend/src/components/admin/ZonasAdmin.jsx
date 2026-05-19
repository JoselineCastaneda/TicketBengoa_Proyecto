import { useEffect, useState } from "react";
import {
  FiAlertTriangle,
  FiCalendar,
  FiCheckCircle,
  FiGrid,
  FiLock,
  FiSave,
  FiUsers,
  FiX,
} from "react-icons/fi";

import {
  MdWorkspacePremium,
  MdDiamond,
  MdTheaters,
} from "react-icons/md";

import {
  HiMiniTicket,
} from "react-icons/hi2";

import {
  FaCrown,
} from "react-icons/fa6";

import { obtenerToken } from "../../auth/auth";
import "../../styles/admin/zonas.css";

const API_URL = "http://localhost:3000/api";

const zonaIconos = {
  "Zona VIP": {
    icon: FaCrown,
    color: "purple",
  },

  "Zona Ejecutiva": {
    icon: MdWorkspacePremium,
    color: "blue",
  },

  "Zona Platinum": {
    icon: MdDiamond,
    color: "pink",
  },

  "Bloque A": {
    icon: MdTheaters,
    color: "orange",
  },

  "Bloque B": {
    icon: MdTheaters,
    color: "green",
  },

  "Bloque E": {
    icon: HiMiniTicket,
    color: "yellow",
  },

  "Bloque F": {
    icon: HiMiniTicket,
    color: "cyan",
  },

  "Zona General A": {
    icon: FiUsers,
    color: "cyan",
  },

  "Zona General B": {
    icon: FiUsers,
    color: "purple",
  },
};

const ZonasAdmin = () => {
  const [eventos, setEventos] = useState([]);
  const [zonas, setZonas] = useState([]);
  const [preciosOriginales, setPreciosOriginales] = useState({});
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
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (data.ok) {
        setEventos(data.conciertos);
      }
    } catch {
      setError("Error al cargar eventos");
    }
  };

  const obtenerZonas = async (idConcierto) => {
    if (!idConcierto) {
      setZonas([]);
      setPreciosOriginales({});
      setEventoInfo(null);
      return;
    }

    setLoading(true);
    setMensaje("");
    setError("");

    try {
      const response = await fetch(`${API_URL}/zonas/concierto/${idConcierto}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (!data.ok) {
        setError(data.mensaje || "Error al cargar zonas");
        return;
      }

      const originales = {};

      data.zonas.forEach((zona) => {
        originales[zona.id_zona] = zona.precio_zona;
      });

      setEventoInfo(data.evento);
      setZonas(data.zonas);
      setPreciosOriginales(originales);
    } catch {
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
        zona.id_zona === idZona ? { ...zona, precio_zona: nuevoPrecio } : zona
      )
    );
  };

  const cancelarCambioPrecio = (idZona) => {
    setMensaje("");
    setError("");

    setZonas((prevZonas) =>
      prevZonas.map((zona) =>
        zona.id_zona === idZona
          ? { ...zona, precio_zona: preciosOriginales[idZona] }
          : zona
      )
    );
  };

  const tieneCambio = (zona) => {
    return Number(zona.precio_zona) !== Number(preciosOriginales[zona.id_zona]);
  };

  const actualizarPrecioZona = async (zona) => {
    setMensaje("");
    setError("");
    setGuardandoId(zona.id_zona);

    if (zona.precio_zona === "" || zona.precio_zona === null) {
      setError("El precio de la zona es obligatorio");
      setGuardandoId(null);
      return;
    }

    if (Number(zona.precio_zona) < 0) {
      setError("El precio no puede ser negativo");
      setGuardandoId(null);
      return;
    }

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
    } catch {
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
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();

      if (!data.ok) {
        setError(data.mensaje || "Error al inicializar zonas");
        return;
      }

      setMensaje("Zonas y asientos creados correctamente");
      obtenerZonas(eventoSeleccionado);
    } catch {
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
    <section className="zonas-admin-page">
      <header className="zonas-page-header">

        <div>
          <span className="zonas-eyebrow">Administración</span>
          <h1>Zonas por Evento</h1>
          <p>Administra zonas, capacidades y precios por cada evento.</p>
        </div>
      </header>

      <section className="zonas-selector-card">
        <div className="zonas-selector-field">
          <label className="zonas-label">Seleccionar evento</label>

          <select
            className="zonas-select"
            value={eventoSeleccionado}
            onChange={handleEventoChange}
          >
            <option value="">Seleccione un evento</option>

            {eventos.map((evento) => (
              <option key={evento.id_concierto} value={evento.id_concierto}>
                {evento.nombre_concierto} - {evento.nombre_artista}
              </option>
            ))}
          </select>
        </div>

        {eventoInfo && (
          <div className="zonas-evento-info">
            <span>Evento:</span>
            <strong>{eventoInfo.nombre_concierto}</strong>

            <span className={`estado-badge estado-${eventoInfo.estado}`}>
              {eventoInfo.estado}
            </span>
          </div>
        )}
      </section>

      {mensaje && <p className="admin-success">{mensaje}</p>}
      {error && <p className="admin-error">{error}</p>}

      {eventoInfo && !puedeEditar && (
        <div className="zonas-warning">
          <FiAlertTriangle />
          <span>Este evento ya no está en borrador. Los precios están bloqueados.</span>
        </div>
      )}

      {!eventoSeleccionado && (
        <div className="zonas-empty">
          <FiCalendar />
          <h3>Selecciona un evento</h3>
          <p>Elige un evento para administrar sus zonas, asientos y precios.</p>
        </div>
      )}

      {loading && (
        <div className="zonas-empty">
          <FiGrid />
          <h3>Cargando zonas...</h3>
          <p>Estamos obteniendo la información del evento seleccionado.</p>
        </div>
      )}

      {eventoSeleccionado && !loading && zonas.length === 0 && (
        <div className="zonas-empty">
          <FiGrid />
          <h3>Este evento todavía no tiene zonas</h3>
          <p>Inicializa automáticamente las zonas, capacidades y asientos del estadio.</p>

          <button
            className="zonas-init-btn"
            onClick={inicializarZonas}
            disabled={inicializando}
          >
            {inicializando ? "Inicializando..." : "Inicializar zonas y asientos"}
          </button>
        </div>
      )}

      {zonas.length > 0 && (
        <>
          <div className="zonas-resumen">
            <div className="zonas-resumen-card purple">
              <FiGrid />
              <div>
                <small>Total zonas</small>
                <strong>{zonas.length}</strong>
                <span>Zonas creadas</span>
              </div>
            </div>

            <div className="zonas-resumen-card blue">
              <FiUsers />
              <div>
                <small>Total asientos</small>
                <strong>{totalAsientos}</strong>
                <span>Asientos totales</span>
              </div>
            </div>

            <div className="zonas-resumen-card green">
              <FiCheckCircle />
              <div>
                <small>Estado del evento</small>
                <strong>{eventoInfo?.estado}</strong>
                <span>Estado actual</span>
              </div>
            </div>

            <div className="zonas-resumen-card pink">
              <FiLock />
              <div>
                <small>Precios</small>
                <strong>{puedeEditar ? "Editables" : "Bloqueados"}</strong>
                <span>{puedeEditar ? "Puede editarse" : "No se pueden editar"}</span>
              </div>
            </div>
          </div>

          <div className="zonas-section-title">
            <h2>Zonas configuradas</h2>
          </div>

          <div className="zonas-grid">
            {zonas.map((zona) => {
              const meta = zonaIconos[zona.nombre_zona] || {
                icon: FiGrid,
                color: "purple",
              };

              const IconoZona = meta.icon;

              return (
                <article className="zona-card" key={zona.id_zona}>
                  <div className="zona-card-header">
                    <div className={`zona-icon ${meta.color}`}>
                      <IconoZona />
                    </div>

                    <div>
                      <h3>{zona.nombre_zona}</h3>
                      <p>{zona.descripcion_zona}</p>
                    </div>
                  </div>

                  <div className="zona-stats">
                    <div>
                      <small>Capacidad</small>
                      <strong>{zona.capacidad_zona}</strong>
                    </div>

                    <div>
                      <small>Asientos registrados</small>
                      <strong>{zona.total_asientos}</strong>
                    </div>
                  </div>

                  <label className="zonas-label">Precio de zona</label>

                  <div className="zona-input-wrap">
                    <input
                      className={`zona-precio-input ${
                        Number(zona.precio_zona) === 0
                          ? "zona-precio-pendiente"
                          : ""
                      }`}
                      type="number"
                      min="0"
                      step="0.01"
                      value={zona.precio_zona}
                      disabled={!puedeEditar}
                      onChange={(e) =>
                        cambiarPrecio(zona.id_zona, e.target.value)
                      }
                    />

                    {!puedeEditar && <FiLock />}
                  </div>

                  {Number(zona.precio_zona) === 0 && (
                    <p className="zona-warning-price">
                      Precio pendiente de configurar
                    </p>
                  )}

                  {tieneCambio(zona) && (
                    <p className="zona-change-text">Tienes cambios sin guardar</p>
                  )}

                  <div className="zona-actions">
                    <button
                      className="zona-save-btn"
                      disabled={
                        !puedeEditar ||
                        guardandoId === zona.id_zona ||
                        !tieneCambio(zona)
                      }
                      onClick={() => actualizarPrecioZona(zona)}
                    >
                      <FiSave />
                      {guardandoId === zona.id_zona ? "Guardando..." : "Guardar"}
                    </button>

                    <button
                      className="zona-cancel-btn"
                      disabled={!puedeEditar || !tieneCambio(zona)}
                      onClick={() => cancelarCambioPrecio(zona.id_zona)}
                    >
                      <FiX />
                      Cancelar
                    </button>
                  </div>

                  {!puedeEditar && (
                    <div className="zona-locked-text">
                      <FiLock />
                      Precio bloqueado
                    </div>
                  )}
                </article>
              );
            })}
          </div>

          <footer className="zonas-footer-note">
            <span>
              Los precios solo pueden editarse cuando el evento está en estado borrador.
            </span>
          </footer>
        </>
      )}
    </section>
  );
};

export default ZonasAdmin;