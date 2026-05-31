import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { cerrarSesion, obtenerUsuarioActivo } from "../auth/auth";

import "../styles/validador/validador.css";

const Validador = () => {
  const navigate = useNavigate();
  const usuario = obtenerUsuarioActivo();

  const [conciertos, setConciertos] = useState([]);
  const [conciertoSeleccionado, setConciertoSeleccionado] = useState("");
  const [ingresos, setIngresos] = useState([]);

  const cargarConciertos = async () => {
    try {
      const response = await fetch(
        "http://localhost:3000/api/validador/conciertos"
      );

      const data = await response.json();

      if (data.ok) {
        setConciertos(data.conciertos);

        if (data.conciertos.length > 0) {
          setConciertoSeleccionado(data.conciertos[0].id_concierto);
        }
      }
    } catch (error) {
      console.error("Error al cargar conciertos:", error);
    }
  };

  const cargarIngresos = async (idConcierto) => {
    if (!idConcierto) return;

    try {
      const response = await fetch(
        `http://localhost:3000/api/validador/ingresos/${idConcierto}`
      );

      const data = await response.json();

      if (data.ok) {
        setIngresos(data.ingresos);
      }
    } catch (error) {
      console.error("Error al cargar ingresos:", error);
    }
  };

  useEffect(() => {
    cargarConciertos();
  }, []);

  useEffect(() => {
    cargarIngresos(conciertoSeleccionado);
  }, [conciertoSeleccionado]);

  const handleLogout = () => {
    cerrarSesion();
    navigate("/login");
  };

  return (
    <main className="validador-page">
      <header className="validador-topbar">
        <div className="validador-brand">
          <span className="brand-icon">TB</span>

          <h2>
            Ticket<span>Bengoa</span>
          </h2>
        </div>

        <button
          className="btn-logout"
          onClick={handleLogout}
          title="Cerrar sesión"
        >
          <span className="logout-icon">↪</span>
          <span className="logout-text">Cerrar sesión</span>
        </button>
      </header>

      <section className="validador-hero">
        <h1>
          Ticket<span>Bengoa</span>
        </h1>

        <p>Validador de Ingresos</p>

        <div className="evento-panel">
          <div className="evento-panel-text">
            <span>Selecciona el concierto a validar</span>

            <small>
              Elige el evento correcto antes de escanear o validar un boleto.
            </small>
          </div>

          <select
            value={conciertoSeleccionado}
            onChange={(e) => setConciertoSeleccionado(e.target.value)}
          >
            {conciertos.length > 0 ? (
              conciertos.map((concierto) => (
                <option
                  key={concierto.id_concierto}
                  value={concierto.id_concierto}
                >
                  {concierto.nombre_concierto}
                </option>
              ))
            ) : (
              <option value="">No hay conciertos activos</option>
            )}
          </select>
        </div>
      </section>

      <section className="validador-main">
        <div className="scanner-card">
          <h2>Escanear código QR</h2>

          <p>
            Posiciona el código QR del boleto dentro del recuadro.
          </p>

          <div className="scanner-box">
            <div className="scanner-icon">▦</div>

            <span>Listo para escanear</span>
          </div>

          <button className="btn-scanner">
            Iniciar cámara
          </button>
        </div>

        <div className="boleto-card">
          <h2>Información del boleto</h2>

          <div className="boleto-info">
            <div className="boleto-row">
              <span>Cliente</span>
              <strong>Pendiente de escaneo</strong>
            </div>

            <div className="boleto-row">
              <span>Evento</span>
              <strong>Selecciona un concierto</strong>
            </div>

            <div className="boleto-row">
              <span>Zona</span>
              <strong>-</strong>
            </div>

            <div className="boleto-row">
              <span>Asiento</span>
              <strong>-</strong>
            </div>

            <div className="boleto-row">
              <span>Estado</span>
              <strong>-</strong>
            </div>
          </div>

          <button className="btn-validar">
            Validar ingreso
          </button>
        </div>
      </section>

      <section className="ingresos-card">
        <h2>Últimos ingresos registrados</h2>

        <div className="tabla-ingresos">
          <table>
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Zona</th>
                <th>Asiento</th>
                <th>Hora</th>
              </tr>
            </thead>

            <tbody>
              {ingresos.length > 0 ? (
                ingresos.map((ingreso) => (
                  <tr key={ingreso.id_validacion}>
                    <td>
                      {ingreso.nombre} {ingreso.apellido}
                    </td>

                    <td>
                      <span className="zona-tag">
                        {ingreso.nombre_zona}
                      </span>
                    </td>

                    <td>
                      {ingreso.fila_asiento}-{ingreso.numero_asiento}
                    </td>

                    <td>{ingreso.hora}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="empty-ingresos"
                  >
                    No hay ingresos registrados para este concierto.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <footer className="validador-footer">
        Ticket<span>Bengoa</span> © 2026
      </footer>
    </main>
  );
};

export default Validador;