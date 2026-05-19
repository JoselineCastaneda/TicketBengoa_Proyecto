import "../../styles/admin/AdminEventos.css";

import { useEffect, useMemo, useState } from "react";
import {
  FiCalendar,
  FiClock,
  FiEdit2,
  FiImage,
  FiPlus,
  FiSave,
  FiSearch,
  FiTrash2,
  FiUpload,
  FiX,
} from "react-icons/fi";

import { obtenerToken } from "../../auth/auth";

const API_URL = "http://localhost:3000/api";

const estadoOptions = [
  { value: "borrador", label: "Borrador" },
  { value: "activo", label: "Activo" },
  { value: "cancelado", label: "Cancelado" },
  { value: "finalizado", label: "Finalizado" },
  { value: "pospuesto", label: "Pospuesto" },
];

const EventosAdmin = () => {
  const [eventos, setEventos] = useState([]);
  const [artistas, setArtistas] = useState([]);

  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState("todos");
  const [idEditando, setIdEditando] = useState(null);

  const [form, setForm] = useState({
    nombre_concierto: "",
    id_artista: "",
    descripcion: "",
    fecha: "",
    hora: "",
    imagen: null,
    estado: "borrador",
  });

  const [imagenActual, setImagenActual] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const token = obtenerToken();

  const limpiarFormulario = () => {
    setIdEditando(null);
    setImagenActual("");
    setMensaje("");
    setError("");

    setForm({
      nombre_concierto: "",
      id_artista: "",
      descripcion: "",
      fecha: "",
      hora: "",
      imagen: null,
      estado: "borrador",
    });
  };

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
    } catch {
      setError("Error al cargar eventos");
    }
  };

  const obtenerArtistas = async () => {
    try {
      const response = await fetch(`${API_URL}/artistas`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.ok) {
        setArtistas(data.artistas);
      }
    } catch {
      setError("Error al cargar artistas");
    }
  };

  useEffect(() => {
    obtenerEventos();
    obtenerArtistas();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "imagen") {
      setForm((prev) => ({
        ...prev,
        imagen: files?.[0] || null,
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const guardarEvento = async () => {
    setMensaje("");
    setError("");

    if (
      !form.nombre_concierto.trim() ||
      !form.id_artista ||
      !form.fecha ||
      !form.hora
    ) {
      setError("Nombre, artista, fecha y hora son obligatorios");
      return;
    }

    const url = idEditando
      ? `${API_URL}/conciertos/${idEditando}`
      : `${API_URL}/conciertos`;

    const method = idEditando ? "PUT" : "POST";

    try {
      const formData = new FormData();

      formData.append("nombre_concierto", form.nombre_concierto);
      formData.append("id_artista", form.id_artista);
      formData.append("descripcion", form.descripcion || "");
      formData.append("fecha", form.fecha);
      formData.append("hora", form.hora);
      formData.append("estado", form.estado);

      if (form.imagen) {
        formData.append("imagen", form.imagen);
      }

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!data.ok) {
        setError(data.mensaje || "No se pudo guardar el evento");
        return;
      }

      setMensaje(
        idEditando
          ? "Evento actualizado correctamente"
          : "Evento creado correctamente"
      );

      limpiarFormulario();
      obtenerEventos();
    } catch {
      setError("Error al guardar evento");
    }
  };

  const cargarEdicion = (evento) => {
    setIdEditando(evento.id_concierto);

    setForm({
      nombre_concierto: evento.nombre_concierto || "",
      id_artista: evento.id_artista || "",
      descripcion: evento.descripcion || "",
      fecha: evento.fecha ? evento.fecha.split("T")[0] : "",
      hora: evento.hora || "",
      imagen: null,
      estado: evento.estado || "borrador",
    });

    setImagenActual(evento.imagen || "");
    setMensaje("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const eliminarEvento = async (id) => {
    const confirmar = window.confirm("¿Seguro que deseas eliminar este evento?");

    if (!confirmar) return;

    setMensaje("");
    setError("");

    try {
      const response = await fetch(`${API_URL}/conciertos/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!data.ok) {
        setError(data.mensaje || "No se pudo eliminar el evento");
        return;
      }

      setMensaje("Evento eliminado correctamente");
      obtenerEventos();
    } catch {
      setError("Error al eliminar evento");
    }
  };

  const eventosFiltrados = eventos.filter((evento) => {
    const texto = `
      ${evento.nombre_concierto || ""}
      ${evento.nombre_artista || ""}
      ${evento.estado || ""}
    `.toLowerCase();

    const coincideBusqueda = texto.includes(busqueda.toLowerCase());

    if (filtro === "todos") return coincideBusqueda;

    return coincideBusqueda && evento.estado === filtro;
  });

  const imagenPreview = useMemo(() => {
    if (form.imagen) {
      return URL.createObjectURL(form.imagen);
    }

    return imagenActual;
  }, [form.imagen, imagenActual]);

  return (
    <section className="eventos-admin-page">
      <header className="eventos-header">
        <div>
          <span className="eventos-eyebrow">Administración</span>
          <h1>Gestión de Eventos</h1>
          <p>Crea, edita y administra los eventos disponibles en el sistema.</p>
        </div>

        <div className="eventos-total-card">
          <span>Total</span>
          <strong>{eventosFiltrados.length}</strong>
        </div>
      </header>

      {mensaje && <p className="eventos-alert success">{mensaje}</p>}
      {error && <p className="eventos-alert error">{error}</p>}

      <section className="eventos-form-card">
        <div className="eventos-card-title">
          <span></span>
          <h2>{idEditando ? "Editar evento" : "Crear nuevo evento"}</h2>
        </div>

        <div className="eventos-form-layout">
          <div className="eventos-form-fields">
            <label>
              Nombre del evento
              <input
                type="text"
                name="nombre_concierto"
                placeholder="Ingrese el nombre del evento"
                value={form.nombre_concierto}
                onChange={handleChange}
              />
            </label>

            <label>
              Artista
              <select
                name="id_artista"
                value={form.id_artista}
                onChange={handleChange}
              >
                <option value="">Seleccione un artista</option>

                {artistas.map((artista) => (
                  <option key={artista.id_artista} value={artista.id_artista}>
                    {artista.nombre_artista}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Fecha
              <input
                type="date"
                name="fecha"
                value={form.fecha}
                onChange={handleChange}
              />
            </label>

            <label>
              Hora
              <input
                type="time"
                name="hora"
                value={form.hora}
                onChange={handleChange}
              />
            </label>

            <label>
              Estado
              <select name="estado" value={form.estado} onChange={handleChange}>
                {estadoOptions.map((estado) => (
                  <option key={estado.value} value={estado.value}>
                    {estado.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="eventos-description-field">
              Descripción
              <textarea
                name="descripcion"
                placeholder="Descripción del evento"
                value={form.descripcion}
                onChange={handleChange}
              />
            </label>

            <div className="eventos-form-actions">

              <button
                type="button"
                className="eventos-btn primary"
                onClick={guardarEvento}
              >
                {idEditando ? <FiSave /> : <FiPlus />}
                {idEditando ? "Actualizar evento" : "Crear evento"}
              </button>

              <button
                type="button"
                className="eventos-btn clean"
                onClick={limpiarFormulario}
              >
                <FiX />
                {idEditando ? "Cancelar edición" : "Limpiar"}
              </button>

            </div>
          </div>

          <aside className="eventos-poster-panel">
            <div className="eventos-poster-title">
              <FiImage />
              <div>
                <h3>Póster del evento</h3>
                <p>Imagen recomendada: JPG, PNG o WEBP</p>
              </div>
            </div>

            <div className="eventos-poster-preview">
              {imagenPreview ? (
                <img src={imagenPreview} alt="Vista previa del evento" />
              ) : (
                <div className="eventos-poster-empty">
                  <FiImage />
                  <span>Sin imagen seleccionada</span>
                </div>
              )}
            </div>

            <label className="eventos-upload-btn">
              <FiUpload />
              {imagenPreview ? "Cambiar imagen" : "Subir imagen"}
              <input
                type="file"
                name="imagen"
                accept="image/*"
                onChange={handleChange}
              />
            </label>

            <small className="eventos-file-name">
              {form.imagen
                ? form.imagen.name
                : imagenActual
                ? "Imagen actual del evento"
                : "Ningún archivo seleccionado"}
            </small>
          </aside>
        </div>
      </section>

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
          {eventosFiltrados.map((evento) => (
            <article className="evento-card" key={evento.id_concierto}>
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
                    onClick={() => cargarEdicion(evento)}
                  >
                    <FiEdit2 />
                    Editar
                  </button>

                  <button
                    type="button"
                    className="eventos-action-btn delete"
                    onClick={() => eliminarEvento(evento.id_concierto)}
                  >
                    <FiTrash2 />
                    Eliminar
                  </button>
                </div>
              </div>
            </article>
          ))}

          {eventosFiltrados.length === 0 && (
            <div className="eventos-empty">No hay eventos registrados.</div>
          )}
        </div>
      </section>
    </section>
  );
};

export default EventosAdmin;