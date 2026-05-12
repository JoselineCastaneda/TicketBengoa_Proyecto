import { useEffect, useState } from "react";

const ArtistasAdmin = () => {
  const [artistas, setArtistas] = useState([]);
  const [idEditando, setIdEditando] = useState(null);
  const [busqueda, setBusqueda] = useState("");

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
  };

  const obtenerArtistas = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/artistas", {
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
    obtenerArtistas();
  }, []);

  const guardarArtista = async () => {
    setMensaje("");
    setError("");

    if (!nombre.trim()) {
      setError("El nombre del artista es obligatorio");
      return;
    }

    const url = idEditando
      ? `http://localhost:3000/api/artistas/${idEditando}`
      : "http://localhost:3000/api/artistas";

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
        setError(data.mensaje);
        return;
      }

      setMensaje(
        idEditando
          ? "Artista actualizado correctamente"
          : "Artista creado correctamente"
      );

      limpiarFormulario();
      obtenerArtistas();
    } catch (error) {
      setError("Error al guardar artista");
    }
  };

  const cargarEdicion = (artista) => {
    setIdEditando(artista.id_artista);
    setNombre(artista.nombre_artista || "");
    setNacionalidad(artista.nacionalidad_artista || "");
    setGenero(artista.genero_musical || "");
    setDescripcion(artista.descripcion_artista || "");
    setMensaje("");
    setError("");
  };

  const eliminarArtista = async (id) => {
    const confirmar = window.confirm(
      "¿Seguro que deseas eliminar este artista?"
    );

    if (!confirmar) return;

    setMensaje("");
    setError("");

    try {
      const response = await fetch(`http://localhost:3000/api/artistas/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!data.ok) {
        setError(data.mensaje);
        return;
      }

      setMensaje("Artista eliminado correctamente");
      obtenerArtistas();
    } catch (error) {
      setError("Error al eliminar artista");
    }
  };

  const artistasFiltrados = artistas.filter((artista) => {
    const texto = `
      ${artista.nombre_artista || ""}
      ${artista.nacionalidad_artista || ""}
      ${artista.genero_musical || ""}
    `.toLowerCase();

    return texto.includes(busqueda.toLowerCase());
  });

  return (
    <div>
      <h1 className="admin-page-title">Gestión de Artistas</h1>

      <div className="admin-toolbar">
        <input
          type="text"
          placeholder="Buscar artista por nombre, nacionalidad o género..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="admin-search"
        />

        <span className="admin-count">
          Total: {artistasFiltrados.length}
        </span>
      </div>

      {mensaje && <p className="admin-success">{mensaje}</p>}
      {error && <p className="admin-error">{error}</p>}

      <div className="form-artista">
        <input
          type="text"
          placeholder="Nombre del artista"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />

        <input
          type="text"
          placeholder="Nacionalidad"
          value={nacionalidad}
          onChange={(e) => setNacionalidad(e.target.value)}
        />

        <input
          type="text"
          placeholder="Género musical"
          value={genero}
          onChange={(e) => setGenero(e.target.value)}
        />

        <textarea
          placeholder="Descripción"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
        />

        <button onClick={guardarArtista}>
          {idEditando ? "Actualizar Artista" : "Crear Artista"}
        </button>

        {idEditando && (
          <button className="btn-cancelar" onClick={limpiarFormulario}>
            Cancelar edición
          </button>
        )}
      </div>

      <div className="tabla-artistas">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Nacionalidad</th>
              <th>Género</th>
              <th>Descripción</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {artistasFiltrados.map((artista) => (
              <tr key={artista.id_artista}>
                <td>{artista.id_artista}</td>
                <td>{artista.nombre_artista}</td>
                <td>{artista.nacionalidad_artista}</td>
                <td>{artista.genero_musical}</td>
                <td>{artista.descripcion_artista}</td>
                <td>
                  <div className="acciones-tabla">
                    <button
                      className="btn-editar"
                      onClick={() => cargarEdicion(artista)}
                    >
                      Editar
                    </button>

                    <button
                      className="btn-eliminar"
                      onClick={() => eliminarArtista(artista.id_artista)}
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {artistasFiltrados.length === 0 && (
              <tr>
                <td colSpan="6" className="tabla-vacia">
                  No hay artistas registrados o no coinciden con la búsqueda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ArtistasAdmin;