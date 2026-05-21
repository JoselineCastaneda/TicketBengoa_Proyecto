import "../../styles/admin/AdminEventos.css";

import { estadoOptions, useEventosAdmin } from "../../hooks/useEventosAdmin";

import EventosForm from "./eventos/EventosForm";
import EventosList from "./eventos/EventosList";

const EventosAdmin = () => {
  const {
    eventosFiltrados,

    artistas,

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
  } = useEventosAdmin();

  return (
    <section className="eventos-admin-page">
      <header className="eventos-header">
        <div>
          <span className="eventos-eyebrow">Administración</span>

          <h1>Gestión de Eventos</h1>

          <p>
            Crea, edita y administra los eventos disponibles en el sistema.
          </p>
        </div>

        <div className="eventos-total-card">
          <span>Total</span>
          <strong>{eventosFiltrados.length}</strong>
        </div>
      </header>

      {mensaje && <p className="eventos-alert success">{mensaje}</p>}
      {error && <p className="eventos-alert error">{error}</p>}

      <EventosForm
        form={form}
        artistas={artistas}
        estadoOptions={estadoOptions}
        idEditando={idEditando}
        imagenActual={imagenActual}
        imagenPreview={imagenPreview}
        handleChange={handleChange}
        guardarEvento={guardarEvento}
        limpiarFormulario={limpiarFormulario}
      />

      <EventosList
        eventos={eventosFiltrados}
        busqueda={busqueda}
        setBusqueda={setBusqueda}
        filtro={filtro}
        setFiltro={setFiltro}
        onEditar={cargarEdicion}
        onEliminar={eliminarEvento}
      />
    </section>
  );
};

export default EventosAdmin;