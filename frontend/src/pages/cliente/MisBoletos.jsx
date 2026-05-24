import { useEffect, useMemo, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

import ClienteNavbar from "../../components/cliente/ClienteNavbar";
import { obtenerToken } from "../../auth/auth";

import "../../styles/cliente/misBoletos.css";

const API_URL = "http://localhost:3000/api";

const MisBoletos = () => {
  const [boletos, setBoletos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("todos");
  const [boletoSeleccionado, setBoletoSeleccionado] = useState(null);

  useEffect(() => {
    const cargarBoletos = async () => {
      try {
        const token = obtenerToken();

        const response = await fetch(`${API_URL}/cliente/boletos`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!data.ok) {
          setError(data.mensaje || "No se pudieron cargar tus boletos.");
          return;
        }

        setBoletos(data.boletos);
      } catch (err) {
        setError("Error de conexión con el servidor.");
      } finally {
        setCargando(false);
      }
    };

    cargarBoletos();
  }, []);

  const boletosFiltrados = useMemo(() => {
    return boletos.filter((boleto) => {
      const texto = `${boleto.nombre_concierto} ${boleto.nombre_artista}`.toLowerCase();

      const coincideBusqueda = texto.includes(busqueda.toLowerCase());

      const coincideEstado =
        estadoFiltro === "todos" || boleto.estado_boleto === estadoFiltro;

      return coincideBusqueda && coincideEstado;
    });
  }, [boletos, busqueda, estadoFiltro]);

  const formatearFecha = (fecha) => {
    if (!fecha) return { dia: "--", mes: "---" };

    const fechaObj = new Date(fecha);

    return {
      dia: fechaObj.toLocaleDateString("es-SV", { day: "2-digit" }),
      mes: fechaObj.toLocaleDateString("es-SV", { month: "short" }).toUpperCase(),
    };
  };

  const formatearHora = (hora) => {
    if (!hora) return "--:--";
    return hora.slice(0, 5);
  };

  return (
    <>
      <ClienteNavbar />

      <main className="misboletos-page">
        <section className="misboletos-container">
          <header className="misboletos-header">
            <h1>Mis boletos</h1>
            <p>Consulta todos tus boletos comprados y visualiza tus códigos QR.</p>
          </header>

          <section className="misboletos-filtros">
            <input
              type="text"
              placeholder="Buscar por evento o artista..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />

            <select
              value={estadoFiltro}
              onChange={(e) => setEstadoFiltro(e.target.value)}
            >
              <option value="todos">Todos</option>
              <option value="activo">Activos</option>
              <option value="usado">Usados</option>
              <option value="cancelado">Cancelados</option>
              <option value="reembolsado">Reembolsados</option>
            </select>
          </section>

          {cargando && (
            <div className="misboletos-empty">
              <h2>Cargando boletos...</h2>
            </div>
          )}

          {error && (
            <div className="misboletos-empty">
              <h2>{error}</h2>
            </div>
          )}

          {!cargando && !error && boletosFiltrados.length === 0 && (
            <div className="misboletos-empty">
              <h2>No se encontraron boletos</h2>
            </div>
          )}

          <section className="misboletos-lista">
            {boletosFiltrados.map((boleto, index) => {
              const fecha = formatearFecha(boleto.fecha);

              return (
                <article className="misboleto-ticket" key={boleto.id_boleto}>
                  <div className="misboleto-color-bar"></div>

                  <div className="misboleto-fecha">
                    <strong>{fecha.dia}</strong>
                    <span>{fecha.mes}</span>
                    <small>{formatearHora(boleto.hora)}</small>
                  </div>

                  <div className="misboleto-evento">
                    <h2>{boleto.nombre_concierto}</h2>
                    <p>{boleto.nombre_artista}</p>
                    <small>Estadio Saturnino Bengoa</small>
                  </div>

                  <div className="misboleto-dato">
                    <span>Zona</span>
                    <strong>{boleto.nombre_zona}</strong>
                  </div>

                  <div className="misboleto-dato">
                    <span>Asiento</span>
                    <strong>{boleto.codigo_svg}</strong>
                  </div>

                  <div className="misboleto-dato">
                    <span>Código</span>
                    <strong>{boleto.codigo_unico}</strong>
                  </div>

                  <div className="misboleto-acciones">
                    <span className={`misboleto-estado estado-${boleto.estado_boleto}`}>
                      {boleto.estado_boleto}
                    </span>

                    <button
                      type="button"
                      onClick={() => setBoletoSeleccionado(boleto)}
                    >
                      Ver QR
                    </button>
                  </div>

                  <div className="misboleto-qr-mini">
                    <QRCodeCanvas
                      value={boleto.token_qr || boleto.codigo_unico}
                      size={105}
                      includeMargin
                    />
                  </div>
                </article>
              );
            })}
          </section>

          <p className="misboletos-nota">
            Tus boletos están protegidos. No compartas tu código QR.
          </p>
        </section>
      </main>

      {boletoSeleccionado && (
        <div className="misboleto-modal-overlay">
          <div className="misboleto-modal">
            <button
              className="misboleto-close"
              onClick={() => setBoletoSeleccionado(null)}
            >
              ×
            </button>

            <h2>{boletoSeleccionado.nombre_concierto}</h2>
            <p>{boletoSeleccionado.nombre_artista}</p>

            <div className="misboleto-qr-grande">
              <QRCodeCanvas
                value={boletoSeleccionado.token_qr || boletoSeleccionado.codigo_unico}
                size={230}
                includeMargin
              />
            </div>

            <div className="misboleto-modal-info">
              <span>{boletoSeleccionado.nombre_zona}</span>
              <strong>Asiento {boletoSeleccionado.codigo_svg}</strong>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MisBoletos;