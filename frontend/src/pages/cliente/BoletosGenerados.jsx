import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";

import ClienteNavbar from "../../components/cliente/ClienteNavbar";
import { obtenerToken } from "../../auth/auth";

import "../../styles/cliente/boletosGenerados.css";

const API_URL = "http://localhost:3000/api";

const BoletosGenerados = () => {
  const { id_venta } = useParams();
  const navigate = useNavigate();

  const [dataCompra, setDataCompra] = useState(null);
  const [boletoSeleccionado, setBoletoSeleccionado] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargarBoletos = async () => {
      try {
        const token = obtenerToken();

        const response = await fetch(
          `${API_URL}/cliente/ventas/${id_venta}/boletos`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!data.ok) {
          setError(data.mensaje || "No se pudieron cargar los boletos.");
          return;
        }

        setDataCompra(data);
      } catch (err) {
        setError("Error de conexión con el servidor.");
      } finally {
        setCargando(false);
      }
    };

    cargarBoletos();
  }, [id_venta]);

  const formatearFecha = (fecha) => {
    if (!fecha) return "Sin fecha";

    return new Date(fecha).toLocaleDateString("es-SV", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatearHora = (hora) => {
    if (!hora) return "Sin hora";

    return hora.slice(0, 5);
  };

  if (cargando) {
    return (
      <>
        <ClienteNavbar />
        <main className="boletos-generados-page">
          <section className="boletos-generados-container">
            <div className="boletos-box">
              <h1>Cargando boletos...</h1>
            </div>
          </section>
        </main>
      </>
    );
  }

  if (error) {
    return (
      <>
        <ClienteNavbar />
        <main className="boletos-generados-page">
          <section className="boletos-generados-container">
            <div className="boletos-box">
              <h1>No se pudieron cargar tus boletos</h1>
              <p>{error}</p>
            </div>
          </section>
        </main>
      </>
    );
  }

  return (
    <>
      <ClienteNavbar />

      <main className="boletos-generados-page">
        <section className="boletos-generados-container">
          <header className="bg-header">
            <p className="bg-success">
              <span>✓</span> Pago realizado con éxito
            </p>

            <h1>
              Tus {dataCompra.boletos.length} boleto
              {dataCompra.boletos.length > 1 ? "s" : ""} han sido generados
            </h1>

            <p className="bg-subtitle">
              Guarda esta información para el ingreso al evento.
            </p>
          </header>

          <section className="bg-resumen-card">
            <div className="bg-evento-main">
              <div className="bg-ticket-icon">🎟</div>

              <div>
                <h2>{dataCompra.evento.nombre_concierto}</h2>
                <p>{dataCompra.evento.nombre_artista}</p>
              </div>

              <strong className="bg-brand">
                Ticket<span>Bengoa</span>
              </strong>
            </div>

            <div className="bg-resumen-grid">
              <div>
                <span>Fecha</span>
                <strong>{formatearFecha(dataCompra.evento.fecha)}</strong>
              </div>

              <div>
                <span>Lugar</span>
                <strong>Estadio Saturnino Bengoa</strong>
              </div>

              <div>
                <span>Hora</span>
                <strong>{formatearHora(dataCompra.evento.hora)}</strong>
              </div>

              <div>
                <span>Compra</span>
                <strong>VEN-{String(dataCompra.venta.id_venta).padStart(6, "0")}</strong>
              </div>

              <div className="bg-total-card">
                <span>Total pagado</span>
                <strong>${Number(dataCompra.venta.total_venta).toFixed(2)}</strong>
                <small>
                  {dataCompra.boletos.length} boleto
                  {dataCompra.boletos.length > 1 ? "s" : ""}
                </small>
              </div>
            </div>
          </section>

          <section className="bg-detalle">
            <div className="bg-detalle-title">
              <span>🎟</span>
              <div>
                <h2>Detalle de tus boletos ({dataCompra.boletos.length})</h2>
                <p>Cada boleto es personal e intransferible.</p>
              </div>
            </div>

            <div className="bg-boletos-lista">
              {dataCompra.boletos.map((boleto, index) => (
                <article className="bg-boleto-row" key={boleto.id_boleto}>
                  <div className="bg-numero">{index + 1}</div>

                  <div className="bg-col">
                    <span>Boleto</span>
                    <strong>{boleto.codigo_unico}</strong>
                  </div>

                  <div className="bg-col">
                    <span>Zona</span>
                    <strong>{boleto.nombre_zona}</strong>
                  </div>

                  <div className="bg-col">
                    <span>Asiento</span>
                    <strong>{boleto.codigo_svg}</strong>
                  </div>

                  <div className="bg-col">
                    <span>Estado</span>
                    <strong className="bg-activo">● {boleto.estado_boleto}</strong>
                  </div>

                  <button
                    type="button"
                    className="bg-btn-qr"
                    onClick={() => setBoletoSeleccionado(boleto)}
                  >
                    Ver QR
                  </button>
                </article>
              ))}
            </div>
          </section>

          <section className="bg-importante">
            <strong>ⓘ Importante</strong>
            <p>
              Presenta el código QR de cada boleto para el ingreso al evento.
              No compartas tus boletos. Es personal e intransferible.
            </p>
          </section>

          <div className="bg-actions">
            <button onClick={() => navigate("/cliente")}>
              Volver al inicio
            </button>

            <button onClick={() => navigate("/cliente/mis-boletos")}>
              Ver mis boletos
            </button>
          </div>
        </section>
      </main>

      {boletoSeleccionado && (
        <div className="bg-modal-overlay">
          <div className="bg-modal">
            <button
              className="bg-modal-close"
              onClick={() => setBoletoSeleccionado(null)}
            >
              ×
            </button>

            <h2>QR del boleto</h2>
            <p>{boletoSeleccionado.codigo_unico}</p>

            <div className="bg-qr-box">
              <QRCodeCanvas
                value={boletoSeleccionado.token_qr}
                size={220}
                level="H"
                includeMargin
              />
            </div>

            <div className="bg-modal-info">
              <span>{boletoSeleccionado.nombre_zona}</span>
              <strong>Asiento {boletoSeleccionado.codigo_svg}</strong>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BoletosGenerados;