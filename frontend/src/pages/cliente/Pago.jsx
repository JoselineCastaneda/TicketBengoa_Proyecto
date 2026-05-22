import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import ClienteNavbar from "../../components/cliente/ClienteNavbar";
import { obtenerToken } from "../../auth/auth";

import "../../styles/cliente/pago.css";

const API_URL = "http://localhost:3000/api";

const metodos = [
  { id: 1, nombre: "Visa", tipo: "visa" },
  { id: 1, nombre: "MasterCard", tipo: "mastercard" },
  { id: 1, nombre: "Tarjeta", tipo: "tarjeta" },
];

const Pago = () => {
  const { idReserva } = useParams();

  const location = useLocation();
  const navigate = useNavigate();

  const token = obtenerToken();

  const reserva = location.state?.reserva;
  const evento = location.state?.evento;
  const asientos = location.state?.asientos || [];
  const total = location.state?.total || 0;

  const [metodoSeleccionado, setMetodoSeleccionado] = useState(metodos[0]);

  const [titular, setTitular] = useState("");
  const [numeroTarjeta, setNumeroTarjeta] = useState("");
  const [cvv, setCvv] = useState("");
  const [mes, setMes] = useState("");
  const [anio, setAnio] = useState("");

  const [procesando, setProcesando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  const volverAsientos = () => {
    if (!reserva?.id_concierto) return;

    navigate(`/cliente/eventos/${reserva.id_concierto}/asientos`);
  };

  const formatearNumeroTarjeta = (valor) => {
    const soloNumeros = valor.replace(/\D/g, "").slice(0, 16);

    return soloNumeros.replace(/(.{4})/g, "$1 ").trim();
  };

  const cambiarNumeroTarjeta = (e) => {
    setNumeroTarjeta(formatearNumeroTarjeta(e.target.value));
  };

  const cambiarCvv = (e) => {
    setCvv(e.target.value.replace(/\D/g, "").slice(0, 3));
  };

  const confirmarPago = async () => {
    try {
      setError("");
      setMensaje("");

      if (!titular.trim() || !numeroTarjeta || !cvv || !mes || !anio) {
        setError("Completa todos los datos de la tarjeta.");
        return;
      }

      if (numeroTarjeta.replace(/\s/g, "").length !== 16) {
        setError("El número de tarjeta debe tener 16 dígitos.");
        return;
      }

      if (cvv.length !== 3) {
        setError("El CVV debe tener 3 dígitos.");
        return;
      }

      setProcesando(true);

      const response = await fetch(`${API_URL}/cliente/pagos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id_reserva: Number(idReserva),
          id_metodo_pago: metodoSeleccionado.id,
        }),
      });

      const data = await response.json();

      if (!data.ok) {
        setError(data.mensaje || "Error al realizar el pago");
        return;
      }

      localStorage.removeItem(
        `reserva_activa_evento_${reserva.id_concierto}`
      );

      setMensaje(
        "Pago realizado correctamente. Redirigiendo a tus boletos..."
      );

      setTimeout(() => {
        navigate(
          `/cliente/boletos-generados/${data.venta.id_venta}`
        );
      }, 1800);
    } catch (err) {
      setError("Error de conexión con el servidor");
    } finally {
      setProcesando(false);
    }
  };

  return (
    <>
      <ClienteNavbar />

      <main className="pago-page">
        <div className="pago-container">
          <section className="pago-header">
            <h1>Pago de boleto</h1>

            <p>
              Completa los datos necesarios para finalizar tu compra.
            </p>
          </section>

          {mensaje && <div className="pago-success">{mensaje}</div>}

          {error && <div className="pago-error">{error}</div>}

          <section className="pago-layout">
            <div className="pago-card">
              <h2>Métodos de pago</h2>

              <p className="pago-subtexto">
                Pagos 100% seguros a través de plataformas confiables.
              </p>

              <div className="metodos-iconos">
                {metodos.map((metodo) => (
                  <button
                    key={metodo.nombre}
                    type="button"
                    className={
                      metodoSeleccionado.nombre === metodo.nombre
                        ? "metodo-icon-card metodo-icon-card-activo"
                        : "metodo-icon-card"
                    }
                    onClick={() => setMetodoSeleccionado(metodo)}
                  >
                    {metodo.tipo === "visa" && (
                      <span className="brand-icon visa-icon">
                        VISA
                      </span>
                    )}

                    {metodo.tipo === "mastercard" && (
                      <span className="brand-icon mastercard-icon">
                        <span></span>

                        <small>Mastercard</small>
                      </span>
                    )}

                    {metodo.tipo === "tarjeta" && (
                      <span className="card-line-icon"></span>
                    )}
                  </button>
                ))}
              </div>

              <div className="pago-formulario">
                <label>
                  Titular de la tarjeta

                  <input
                    type="text"
                    placeholder="Nombre del titular"
                    value={titular}
                    onChange={(e) => setTitular(e.target.value)}
                  />
                </label>

                <label>
                  Número de tarjeta

                  <input
                    type="text"
                    placeholder="0000 0000 0000 0000"
                    maxLength="19"
                    value={numeroTarjeta}
                    onChange={cambiarNumeroTarjeta}
                  />
                </label>

                <div className="pago-form-row">
                  <label>
                    CVV

                    <input
                      type="text"
                      placeholder="123"
                      maxLength="3"
                      value={cvv}
                      onChange={cambiarCvv}
                    />
                  </label>

                  <label>
                    Mes

                    <select
                      value={mes}
                      onChange={(e) => setMes(e.target.value)}
                    >
                      <option value="">Mes</option>

                      {Array.from({ length: 12 }, (_, i) => {
                        const valor = String(i + 1).padStart(2, "0");

                        return (
                          <option key={valor} value={valor}>
                            {valor}
                          </option>
                        );
                      })}
                    </select>
                  </label>

                  <label>
                    Año

                    <select
                      value={anio}
                      onChange={(e) => setAnio(e.target.value)}
                    >
                      <option value="">Año</option>

                      {[2026, 2027, 2028, 2029, 2030, 2031, 2032].map(
                        (year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        )
                      )}
                    </select>
                  </label>
                </div>
              </div>

              <button
                className="btn-confirmar-pago"
                onClick={confirmarPago}
                disabled={procesando}
              >
                {procesando
                  ? "Procesando pago..."
                  : "Confirmar pago"}
              </button>

              <button
                className="btn-volver"
                onClick={volverAsientos}
                disabled={procesando}
              >
                Volver a mis asientos
              </button>
            </div>

            <aside className="pago-resumen">
              <h2 className="resumen-titulo">
                Resumen de compra
              </h2>

              <p className="resumen-subtitulo">
                Revisa tus asientos antes de confirmar el pago.
              </p>

              <div className="resumen-info-pago">
                <p>
                  <strong>Concierto:</strong>{" "}
                  {evento?.nombre_concierto}
                </p>

                <p>
                  <strong>Método:</strong>{" "}
                  {metodoSeleccionado.nombre}
                </p>
              </div>

              <div className="resumen-lista">
                {asientos.map((asiento) => (
                  <div
                    className="resumen-item"
                    key={asiento.id_asiento}
                  >
                    <div>
                      <strong>{asiento.codigo_svg}</strong>

                      <span>{asiento.nombre_zona}</span>
                    </div>

                    <strong>
                      $
                      {Number(asiento.precio_zona).toFixed(2)}
                    </strong>
                  </div>
                ))}
              </div>

              <div className="resumen-total">
                <span>Total</span>

                <strong>
                  ${Number(total).toFixed(2)}
                </strong>
              </div>
            </aside>
          </section>
        </div>
      </main>
    </>
  );
};

export default Pago;