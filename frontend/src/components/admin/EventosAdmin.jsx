import { useEffect, useState } from "react";
import { obtenerToken } from "../../auth/auth";

const API_URL = "http://localhost:3000/api";

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
    } catch (error) {
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
    } catch (error) {
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
      setForm({
        ...form,
        imagen: files[0] || null,
      });
      return;
    }

    setForm({
      ...form,
      [name]: value,
    });
  };

  const guardarEvento = async () => {
    setMensaje("");
    setError("");

    if (!form.nombre_concierto || !form.id_artista || !form.fecha || !form.hora) {
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
    } catch (error) {
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
    } catch (error) {
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

  return (
    <div>
      <h1 className="admin-page-title">Gestión de Eventos</h1>

      <div className="admin-toolbar">
        <input
          type="text"
          placeholder="Buscar evento por nombre, artista o estado..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="admin-search"
        />

        <select
          className="admin-filter"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        >
          <option value="todos">Todos</option>
          <option value="borrador">Borradores</option>
          <option value="activo">Activos</option>
          <option value="cancelado">Cancelados</option>
          <option value="finalizado">Finalizados</option>
          <option value="pospuesto">Pospuestos</option>
        </select>

        <span className="admin-count">Total: {eventosFiltrados.length}</span>
      </div>

      {mensaje && <p className="admin-success">{mensaje}</p>}
      {error && <p className="admin-error">{error}</p>}

      <div className="form-artista">
        <input
          type="text"
          name="nombre_concierto"
          placeholder="Nombre del evento"
          value={form.nombre_concierto}
          onChange={handleChange}
        />

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

        <input
          type="date"
          name="fecha"
          value={form.fecha}
          onChange={handleChange}
        />

        <input
          type="time"
          name="hora"
          value={form.hora}
          onChange={handleChange}
        />

        <input
          type="file"
          name="imagen"
          accept="image/*"
          onChange={handleChange}
        />

        <select name="estado" value={form.estado} onChange={handleChange}>
          <option value="borrador">Borrador</option>
          <option value="activo">Activo</option>
          <option value="cancelado">Cancelado</option>
          <option value="finalizado">Finalizado</option>
          <option value="pospuesto">Pospuesto</option>
        </select>

        <textarea
          name="descripcion"
          placeholder="Descripción del evento"
          value={form.descripcion}
          onChange={handleChange}
        />

        {(form.imagen || imagenActual) && (
          <div className="poster-preview">
            <img
              src={form.imagen ? URL.createObjectURL(form.imagen) : imagenActual}
              alt="Vista previa del poster"
            />
          </div>
        )}

        <button onClick={guardarEvento}>
          {idEditando ? "Actualizar Evento" : "Crear Evento"}
        </button>

        {idEditando && (
          <button className="btn-cancelar" onClick={limpiarFormulario}>
            Cancelar edición
          </button>
        )}
      </div>

      <div className="eventos-grid">
        {eventosFiltrados.map((evento) => (
          <div className="evento-card" key={evento.id_concierto}>
            <div className="evento-img-box">
              {evento.imagen ? (
                <img src={evento.imagen} alt={evento.nombre_concierto} />
              ) : (
                <div className="evento-img-placeholder">Sin imagen</div>
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

              <p>
                <strong>Fecha:</strong> {evento.fecha?.split("T")[0]}
              </p>

              <p>
                <strong>Hora:</strong> {evento.hora}
              </p>

              <div className="acciones-tabla">
                <button
                  className="btn-editar"
                  onClick={() => cargarEdicion(evento)}
                >
                  Editar
                </button>

                <button
                  className="btn-eliminar"
                  onClick={() => eliminarEvento(evento.id_concierto)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}

        {eventosFiltrados.length === 0 && (
          <div className="tabla-vacia">No hay eventos registrados.</div>
        )}
      </div>
    </div>
  );
};

export default EventosAdmin;