import { useEffect, useState } from "react";
import {
  FiCalendar,
  FiChevronRight,
  FiShoppingBag,
  FiUsers,
} from "react-icons/fi";

import "../../styles/admin/dashboard.css";

const API_DASHBOARD = "http://localhost:3000/api/admin/dashboard";

const DashboardAdmin = () => {
  const [dashboard, setDashboard] = useState(null);
  const [cargando, setCargando] = useState(true);

  const cargarDashboard = async () => {
    try {
      const respuesta = await fetch(API_DASHBOARD);
      const data = await respuesta.json();

      if (data.ok) {
        setDashboard(data);
      }
    } catch (error) {
      console.error("Error al cargar dashboard:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDashboard();
  }, []);

  const resumen = dashboard?.resumen || {
    ventasTotales: 0,
    entradasVendidas: 0,
    eventosActivos: 0,
    clientes: 0,
  };

  const ventasPorDia = dashboard?.ventasPorDia || [];
  const maxVenta = Math.max(...ventasPorDia.map((item) => item.total), 1);

  const puntos = ventasPorDia
    .map((item, index) => {
      const x =
        ventasPorDia.length === 1
          ? 50
          : (index / (ventasPorDia.length - 1)) * 100;

      const y = 100 - (item.total / maxVenta) * 80;

      return `${x},${y}`;
    })
    .join(" ");

  if (cargando) {
    return (
      <section className="dashboard-admin">
        <h1 className="dashboard-loading">Cargando panel...</h1>
      </section>
    );
  }

  return (
    <section className="dashboard-admin">
      <div className="dashboard-header">
        <h1>Panel de Control</h1>
      </div>

      <div className="dashboard-cards">
        <div className="dashboard-card">
          <div className="dashboard-icon">
            <FiShoppingBag />
          </div>
          <span>VENTAS TOTALES</span>
          <h2>${Number(resumen.ventasTotales).toFixed(2)}</h2>
          <p>Ingresos registrados</p>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-icon">
            <FiUsers />
          </div>
          <span>ENTRADAS VENDIDAS</span>
          <h2>{resumen.entradasVendidas}</h2>
          <p>Boletos activos</p>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-icon">
            <FiCalendar />
          </div>
          <span>EVENTOS ACTIVOS</span>
          <h2>{resumen.eventosActivos}</h2>
          <p>Eventos publicados</p>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-icon">
            <FiUsers />
          </div>
          <span>CLIENTES</span>
          <h2>{resumen.clientes}</h2>
          <p>Clientes registrados</p>
        </div>
      </div>

      <div className="dashboard-middle">
        <div className="dashboard-panel">
          <div className="panel-header">
            <h3>Próximos Eventos</h3>
          </div>

          <div className="event-list">
            {dashboard?.proximosEventos?.length > 0 ? (
              dashboard.proximosEventos.map((evento) => (
                <div className="event-item" key={evento.id_concierto}>
                  <div className="event-info">
                    <h4>{evento.nombre_concierto}</h4>
                    <p>
                      {new Date(evento.fecha).toLocaleDateString("es-SV", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>

                  <span className="status-active">{evento.estado}</span>
                  <FiChevronRight />
                </div>
              ))
            ) : (
              <p className="empty-text">No hay próximos eventos</p>
            )}
          </div>
        </div>

        <div className="dashboard-chart-panel">
          <div className="panel-header">
            <div>
              <h3>Ventas por día</h3>
              <p>Últimos registros de ventas pagadas</p>
            </div>
          </div>

          {ventasPorDia.length > 0 ? (
            <div className="custom-chart">
              <svg viewBox="0 0 100 110" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a855f7" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#a855f7" stopOpacity="0.02" />
                  </linearGradient>
                </defs>

                <polyline
                  className="chart-area"
                  points={`0,100 ${puntos} 100,100`}
                />

                <polyline className="chart-line" points={puntos} />

                {ventasPorDia.map((item, index) => {
                  const x =
                    ventasPorDia.length === 1
                      ? 50
                      : (index / (ventasPorDia.length - 1)) * 100;

                  const y = 100 - (item.total / maxVenta) * 80;

                  return (
                    <circle
                      key={index}
                      className="chart-dot"
                      cx={x}
                      cy={y}
                      r="1.5"
                    />
                  );
                })}
              </svg>

              <div className="chart-labels">
                {ventasPorDia.map((item, index) => (
                  <span key={index}>{item.fecha}</span>
                ))}
              </div>
            </div>
          ) : (
            <p className="empty-text">No hay datos para la gráfica</p>
          )}
        </div>
      </div>

      <div className="dashboard-panel ventas-recientes-panel">
        <div className="panel-header">
          <div>
            <h3>Ventas Recientes</h3>
            <p>Detalle de las últimas compras registradas</p>
          </div>
        </div>

        <div className="sales-list">
          {dashboard?.ventasRecientes?.length > 0 ? (
            dashboard.ventasRecientes.map((venta) => (
              <div className="sale-item sale-item-full" key={venta.id_venta}>
                <div className="avatar">
                  {(venta.nombre?.charAt(0) || "").toUpperCase()}
                  {(venta.apellido?.charAt(0) || "").toUpperCase()}
                </div>

                <div className="sale-info">
                  <h4>
                    {venta.nombre} {venta.apellido}
                  </h4>

                  <div className="sale-meta">
                    <span className="sale-event">
                      Evento: {venta.nombre_concierto}
                    </span>

                    <span className="sale-zone">
                      Zona: {venta.zonas}
                    </span>

                    <span className="sale-tickets">
                      Boletos: {venta.cantidad_boletos}
                    </span>
                  </div>
                </div>

                <div className="sale-date">
                  <p>{venta.fecha_formateada}</p>
                  <span>{venta.hora_formateada}</span>
                </div>

                <strong>${Number(venta.total).toFixed(2)}</strong>
              </div>
            ))
          ) : (
            <p className="empty-text">No hay ventas recientes</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default DashboardAdmin;