import { useEffect, useMemo, useState } from "react";
import {
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiSearch,
  FiSave,
  FiX,
  FiFilter,
  FiUsers,
} from "react-icons/fi";

import "../../styles/admin/AdminArtistas.css";

const API_URL = "http://localhost:3000/api/artistas";

const ArtistasAdmin = () => {
  const [artistas, setArtistas] = useState([]);
  const [artistaSeleccionado, setArtistaSeleccionado] = useState(null);
  const [idEditando, setIdEditando] = useState(null);

  const [busqueda, setBusqueda] = useState("");
  const [filtroGenero, setFiltroGenero] = useState("todos");

  const [nombre, setNombre] = useState("");
  const [nacionalidad, setNacionalidad] = useState("");
  const [genero, setGenero] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const limpiarFormulario = () => {
    setIdEditando(null);
    setNombre("");
    setNacionalidad("");
    setGenero("");
    setDescripcion("");
    setMensaje("");
    setError("");
  };

  const obtenerArtistas = async () => {
    try {
      const response = await fetch(API_URL, {
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
    obtenerArtistas();
  }, []);

  const guardarArtista = async () => {
    setMensaje("");
    setError("");

    if (!nombre.trim()) {
      setError("El nombre del artista es obligatorio");
      return;
    }

    const url = idEditando ? `${API_URL}/${idEditando}` : API_URL;
    const method = idEditando ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nombre_artista: nombre,
          nacionalidad_artista: nacionalidad,
          genero_musical: genero,
          descripcion_artista: descripcion,
        }),
      });

      const data = await response.json();

      if (!data.ok) {
        setError(data.mensaje || "No se pudo guardar el artista");
        return;
      }

      setMensaje(
        idEditando
          ? "Artista actualizado correctamente"
          : "Artista creado correctamente"
      );

      limpiarFormulario();
      obtenerArtistas();
    } catch {
      setError("Error al guardar artista");
    }
  };

  const cargarEdicion = (artista) => {
    if (!artista) return;

    setIdEditando(artista.id_artista);
    setArtistaSeleccionado(artista);

    setNombre(artista.nombre_artista || "");
    setNacionalidad(artista.nacionalidad_artista || "");
    setGenero(artista.genero_musical || "");
    setDescripcion(artista.descripcion_artista || "");

    setMensaje("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const eliminarArtista = async (id) => {
    if (!id) return;

    const confirmar = window.confirm(
      "¿Seguro que deseas eliminar este artista?"
    );

    if (!confirmar) return;

    setMensaje("");
    setError("");

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!data.ok) {
        setError(data.mensaje || "No se pudo eliminar el artista");
        return;
      }

      setMensaje("Artista eliminado correctamente");
      setArtistaSeleccionado(null);
      obtenerArtistas();
    } catch {
      setError("Error al eliminar artista");
    }
  };

  const normalizarTexto = (texto = "") => {
    return texto
      .toString()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  };

  const generosDisponibles = useMemo(() => {
    const generos = artistas
      .map((artista) => artista.genero_musical)
      .filter(Boolean);

    return [...new Set(generos)];
  }, [artistas]);

  const artistasFiltrados = artistas.filter((artista) => {
    const textoArtista = normalizarTexto(`
      ${artista.nombre_artista || ""}
      ${artista.nacionalidad_artista || ""}
      ${artista.genero_musical || ""}
      ${artista.descripcion_artista || ""}
    `);

    const palabrasBusqueda = normalizarTexto(busqueda)
      .split(" ")
      .filter(Boolean);

    const coincideBusqueda = palabrasBusqueda.every((palabra) =>
      textoArtista.includes(palabra)
    );

    const coincideGenero =
      filtroGenero === "todos" || artista.genero_musical === filtroGenero;

    return coincideBusqueda && coincideGenero;
  });

  const seleccionarArtista = (artista) => {
    setArtistaSeleccionado(artista);

    setTimeout(() => {
      const accionesPanel = document.querySelector(
        ".artistas-actions-panel"
      );

      if (accionesPanel) {
        accionesPanel.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }, 100);
  };

  const obtenerIniciales = (nombreArtista = "") => {
    return nombreArtista
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((palabra) => palabra.charAt(0).toUpperCase())
      .join("");
  };

  return (
    <section className="artistas-admin-page">
      <header className="artistas-header">
        <div>
          <span className="artistas-eyebrow">Administración</span>
          <h1>Gestión de Artistas</h1>
          <p>
            Administra la información de los artistas registrados en el sistema.
          </p>
        </div>

        <div className="artistas-total-card">
          <span>Total de artistas</span>
          <strong>{artistasFiltrados.length}</strong>
          <FiUsers />
        </div>
      </header>

      <div className="artistas-toolbar">
        <div className="artistas-search-box">
          <FiSearch />
          <input
            type="text"
            placeholder="Buscar por nombre, nacionalidad o género..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <div className="artistas-filter-box">
          <FiFilter />
          <select
            value={filtroGenero}
            onChange={(e) => setFiltroGenero(e.target.value)}
          >
            <option value="todos">Todos los géneros</option>

            {generosDisponibles.map((generoItem) => (
              <option key={generoItem} value={generoItem}>
                {generoItem}
              </option>
            ))}
          </select>
        </div>
      </div>

      {mensaje && <p className="artistas-alert success">{mensaje}</p>}
      {error && <p className="artistas-alert error">{error}</p>}

      <div className="artistas-content-grid">
        <form
          className="artistas-form-card"
          onSubmit={(e) => {
            e.preventDefault();
            guardarArtista();
          }}
        >
          <div className="artistas-card-title">
            <span></span>
            <h2>{idEditando ? "Editar Artista" : "Crear Artista"}</h2>
          </div>

          <label>
            Nombre del artista
            <input
              type="text"
              placeholder="Ingrese el nombre del artista"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </label>

          <label>
            Nacionalidad
            <input
              type="text"
              placeholder="Ingrese la nacionalidad"
              value={nacionalidad}
              onChange={(e) => setNacionalidad(e.target.value)}
            />
          </label>

          <label>
            Género musical
            <input
              type="text"
              placeholder="Ingrese el género musical"
              value={genero}
              onChange={(e) => setGenero(e.target.value)}
            />
          </label>

          <label>
            Descripción
            <textarea
              placeholder="Breve descripción del artista..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              maxLength={250}
            />
            <small>{descripcion.length}/250</small>
          </label>

          <div className="artistas-form-actions">
            <button type="submit" className="artistas-btn primary">
              {idEditando ? <FiSave /> : <FiPlus />}
              {idEditando ? "Actualizar" : "Crear Artista"}
            </button>

            <button
              type="button"
              className="artistas-btn secondary"
              onClick={limpiarFormulario}
            >
              <FiX />
              {idEditando ? "Cancelar edición" : "Limpiar formulario"}
            </button>
          </div>
        </form>

        <div className="artistas-main-area">
          <div className="artistas-table-card">
            <div className="artistas-card-title">
              <span></span>
              <h2>Artistas Registrados</h2>
            </div>

            <div className="artistas-table-wrapper">
              <table className="artistas-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Nacionalidad</th>
                    <th>Género</th>
                    <th>Descripción</th>
                    
                  </tr>
                </thead>

                <tbody>
                  {artistasFiltrados.map((artista) => (
                    <tr
                      key={artista.id_artista}
                      className={
                        artistaSeleccionado?.id_artista === artista.id_artista
                          ? "artista-row selected"
                          : "artista-row"
                      }
                      onClick={() => seleccionarArtista(artista)}
                    >
                      <td>
                        <div className="artista-name-cell">
                          <div className="artista-iniciales">
                            {obtenerIniciales(artista.nombre_artista)}
                          </div>

                          <strong>{artista.nombre_artista}</strong>
                        </div>
                      </td>

                      <td>
                        {artista.nacionalidad_artista || "No especificada"}
                      </td>

                      <td>
                        <span className="artistas-badge">
                          {artista.genero_musical || "Sin género"}
                        </span>
                      </td>

                      <td className="artistas-description">
                        {artista.descripcion_artista || "Sin descripción"}
                      </td>

                    </tr>
                  ))}

                  {artistasFiltrados.length === 0 && (
                    <tr>
                      <td colSpan="4" className="artistas-empty">
                        No hay artistas registrados o no coinciden con la
                        búsqueda.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <aside className="artistas-actions-panel">
            <div className="artistas-card-title">
              <span></span>
              <h2>Acciones</h2>
            </div>

            {artistaSeleccionado ? (
              <>
                <div className="artistas-selected-info">
                  <div className="artista-iniciales large">
                    {obtenerIniciales(artistaSeleccionado.nombre_artista)}
                  </div>

                  <div>
                    <strong>{artistaSeleccionado.nombre_artista}</strong>
                    <span>
                      {artistaSeleccionado.genero_musical || "Sin género"} ·{" "}
                      {artistaSeleccionado.nacionalidad_artista ||
                        "Sin nacionalidad"}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  className="artistas-action-option edit"
                  onClick={() => cargarEdicion(artistaSeleccionado)}
                >
                  <FiEdit2 />
                  <span>
                    <strong>Editar artista</strong>
                    <small>Modificar información</small>
                  </span>
                </button>

                <button
                  type="button"
                  className="artistas-action-option delete"
                  onClick={() => eliminarArtista(artistaSeleccionado.id_artista)}
                >
                  <FiTrash2 />
                  <span>
                    <strong>Eliminar artista</strong>
                    <small>Eliminar permanentemente</small>
                  </span>
                </button>
              </>
            ) : (
              <p className="artistas-no-selection">
                Selecciona un artista de la lista para realizar acciones
                rápidas.
              </p>
            )}
          </aside>
        </div>
      </div>
    </section>
  );
};

export default ArtistasAdmin;