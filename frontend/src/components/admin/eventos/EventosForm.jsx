import {
  FiImage,
  FiPlus,
  FiSave,
  FiUpload,
  FiX,
} from "react-icons/fi";

const EventosForm = ({
  form,
  artistas,
  estadoOptions,
  idEditando,
  imagenActual,
  imagenPreview,
  handleChange,
  guardarEvento,
  limpiarFormulario,
}) => {
  return (
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
  );
};

export default EventosForm;