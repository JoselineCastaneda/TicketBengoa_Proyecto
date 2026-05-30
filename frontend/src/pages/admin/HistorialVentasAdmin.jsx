import { useEffect, useMemo, useState } from "react";
import "../../styles/admin/historialVentas.css";

const HistorialVentasAdmin = () => {
  const [ventas, setVentas] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [evento, setEvento] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);

  const ventasPorPagina = 7;

  const cargarVentas = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/admin/ventas");
      const data = await response.json();

      if (data.ok) {
        setVentas(data.ventas);
      }
    } catch (error) {
      console.error("Error al cargar ventas:", error);
    }
  };

  useEffect(() => {
    cargarVentas();
  }, []);

  const eventosUnicos = useMemo(() => {
    return [...new Set(ventas.map((venta) => venta.nombre_concierto))];
  }, [ventas]);

  const ventasFiltradas = useMemo(() => {
    return ventas.filter((venta) => {
      const textoBusqueda = `${venta.cliente} ${venta.correo_electronico} ${venta.nombre_concierto} ${venta.zonas}`.toLowerCase();

      const coincideBusqueda = textoBusqueda.includes(busqueda.toLowerCase());

      const coincideEvento = evento
        ? venta.nombre_concierto === evento
        : true;

      const fechaVenta = new Date(venta.fecha_venta);
      const desde = fechaDesde ? new Date(fechaDesde) : null;
      const hasta = fechaHasta ? new Date(fechaHasta) : null;

      const coincideDesde = desde ? fechaVenta >= desde : true;
      const coincideHasta = hasta ? fechaVenta <= hasta : true;

      return (
        coincideBusqueda &&
        coincideEvento &&
        coincideDesde &&
        coincideHasta
      );
    });
  }, [ventas, busqueda, evento, fechaDesde, fechaHasta]);

  const totalPaginas = Math.ceil(ventasFiltradas.length / ventasPorPagina);

  const ventasPaginadas = ventasFiltradas.slice(
    (paginaActual - 1) * ventasPorPagina,
    paginaActual * ventasPorPagina
  );

  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda, evento, fechaDesde, fechaHasta]);

  return (
    <section className="historial-ventas">
      <div className="historial-header">
        <h1>Historial de Ventas</h1>
      </div>

      <div className="historial-filtros">
        <div className="filtro-grupo">
          <label>Buscar</label>
          <input
            type="text"
            placeholder="Buscar cliente o concierto..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <div className="filtro-grupo">
          <label>Evento</label>
          <select value={evento} onChange={(e) => setEvento(e.target.value)}>
            <option value="">Todos los eventos</option>

            {eventosUnicos.map((nombreEvento) => (
              <option key={nombreEvento} value={nombreEvento}>
                {nombreEvento}
              </option>
            ))}
          </select>
        </div>

        <div className="filtro-grupo">
          <label>Fecha desde</label>
          <input
            type="date"
            value={fechaDesde}
            onChange={(e) => setFechaDesde(e.target.value)}
          />
        </div>

        <div className="filtro-grupo">
          <label>Fecha hasta</label>
          <input
            type="date"
            value={fechaHasta}
            onChange={(e) => setFechaHasta(e.target.value)}
          />
        </div>
      </div>

      <div className="tabla-container">
        <table className="tabla-ventas">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Evento</th>
              <th>Zona</th>
              <th>Boletos</th>
              <th>Fecha</th>
              <th>Total</th>
              <th>Estado</th>
            </tr>
          </thead>

          <tbody>
            {ventasPaginadas.length > 0 ? (
              ventasPaginadas.map((venta) => (
                <tr key={venta.id_venta}>
                  <td>
                    <div className="cliente-cell">
                      <div className="cliente-avatar">
                        {venta.cliente
                          ?.split(" ")
                          .map((parte) => parte[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>

                      <div className="cliente-info">
                        <strong>{venta.cliente}</strong>
                        <span>{venta.correo_electronico}</span>
                      </div>
                    </div>
                  </td>

                  <td>{venta.nombre_concierto}</td>

                  <td>
                    <span className="zona-badge">{venta.zonas}</span>
                  </td>

                  <td>{venta.cantidad_boletos}</td>

                  <td>
                    {venta.fecha_formateada}
                    <br />
                    <span>{venta.hora_formateada}</span>
                  </td>

                  <td className="monto">
                    ${Number(venta.total_venta).toFixed(2)}
                  </td>

                  <td>
                    <span className={`estado-badge estado-${venta.estado_venta}`}>
                      {venta.estado_venta}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="sin-resultados">
                  No hay ventas para mostrar.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="tabla-footer">
          <p>
            Mostrando {ventasPaginadas.length} de {ventasFiltradas.length} ventas
          </p>

          <div className="paginacion">
            <button
              disabled={paginaActual === 1}
              onClick={() => setPaginaActual(paginaActual - 1)}
            >
              Anterior
            </button>

            <span>
              Página {paginaActual} de {totalPaginas || 1}
            </span>

            <button
              disabled={paginaActual === totalPaginas || totalPaginas === 0}
              onClick={() => setPaginaActual(paginaActual + 1)}
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HistorialVentasAdmin;