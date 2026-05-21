import { useEffect, useMemo, useState } from "react";
import { obtenerToken } from "../auth/auth";

const API_URL = "http://localhost:3000/api";

const formInicial = {
  nombre_concierto: "",
  id_artista: "",
  descripcion: "",
  fecha: "",
  hora: "",
  imagen: null,
  estado: "borrador",
};

export const estadoOptions = [
  { value: "borrador", label: "Borrador" },
  { value: "activo", label: "Activo" },
  { value: "cancelado", label: "Cancelado" },
  { value: "finalizado", label: "Finalizado" },
  { value: "pospuesto", label: "Pospuesto" },
];

export const useEventosAdmin = () => {
  const [eventos, setEventos] = useState([]);
  const [artistas, setArtistas] = useState([]);

  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState("todos");
  const [idEditando, setIdEditando] = useState(null);

  const [form, setForm] = useState(formInicial);
  const [imagenActual, setImagenActual] = useState("");

  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const token = obtenerToken();

  const limpiarFormulario = () => {
    setIdEditando(null);
    setImagenActual("");
    setMensaje("");
    setError("");
    setForm(formInicial);
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

    if (filtro === "todos") {
      return coincideBusqueda;
    }

    return coincideBusqueda && evento.estado === filtro;
  });

  const imagenPreview = useMemo(() => {
    if (form.imagen) {
      return URL.createObjectURL(form.imagen);
    }

    return imagenActual;
  }, [form.imagen, imagenActual]);

  return {
    eventos,
    artistas,
    eventosFiltrados,

    busqueda,
    setBusqueda,

    filtro,
    setFiltro,

    idEditando,

    form,
    imagenActual,
    imagenPreview,

    mensaje,
    error,

    handleChange,
    guardarEvento,
    limpiarFormulario,
    cargarEdicion,
    eliminarEvento,
  };
};