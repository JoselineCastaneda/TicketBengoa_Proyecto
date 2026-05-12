import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { obtenerToken } from "../../auth/auth";
import ClienteNavbar from "../../components/cliente/ClienteNavbar";
import ClienteFooter from "../../components/cliente/ClienteFooter";
import "../../styles/cliente/seleccionAsientos.css";

const API_URL = "http://localhost:3000/api";
const MAX_ASIENTOS = 6;
const REFRESCO_MS = 10000;

const SeleccionAsiento = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [evento, setEvento] = useState(null);
  const [zonas, setZonas] = useState([]);
  const [asientos, setAsientos] = useState([]);
  const [zonaSeleccionada, setZonaSeleccionada] = useState(null);
  const [asientosSeleccionados, setAsientosSeleccionados] = useState([]);

  const [reserva, setReserva] = useState(null);
  const [segundosRestantes, setSegundosRestantes] = useState(0);

  const [loading, setLoading] = useState(true);
  const [reservando, setReservando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const token = obtenerToken();

  const cargarAsientos = async () => {
    try {
      const response = await fetch(`${API_URL}/cliente/eventos/${id}/asientos`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!data.ok) {
        setError(data.mensaje || "Error al cargar asientos");
        return;
      }

      setEvento(data.evento);
      setZonas(data.zonas);
      setAsientos(data.asientos);

      if (!zonaSeleccionada && data.zonas.length > 0) {
        setZonaSeleccionada(data.zonas[0]);
      }
    } catch (error) {
      setError("Error de conexión al cargar asientos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarAsientos();

    const intervalo = setInterval(() => {
      cargarAsientos();
    }, REFRESCO_MS);

    return () => clearInterval(intervalo);
  }, [id]);

  useEffect(() => {
    if (!reserva?.fecha_expiracion) return;

    const actualizarContador = () => {
      const ahora = new Date().getTime();
      const expiracion = new Date(reserva.fecha_expiracion).getTime();
      const diferencia = Math.max(Math.floor((expiracion - ahora) / 1000), 0);

      setSegundosRestantes(diferencia);

      if (diferencia === 0) {
        setReserva(null);
        setAsientosSeleccionados([]);
        cargarAsientos();
      }
    };

    actualizarContador();

    const intervalo = setInterval(actualizarContador, 1000);

    return () => clearInterval(intervalo);
  }, [reserva]);

  const asientosZona = useMemo(() => {
    if (!zonaSeleccionada) return [];

    return asientos.filter(
      (asiento) => asiento.id_zona === zonaSeleccionada.id_zona
    );
  }, [asientos, zonaSeleccionada]);

  const total = asientosSeleccionados.reduce(
    (acc, asiento) => acc + Number(asiento.precio_zona),
    0
  );

  const formatearTiempo = (segundos) => {
    const min = Math.floor(segundos / 60);
    const seg = segundos % 60;

    return `${String(min).padStart(2, "0")}:${String(seg).padStart(2, "0")}`;
  };

  const seleccionarZona = (zona) => {
    if (reserva) return;

    setZonaSeleccionada(zona);
    setAsientosSeleccionados([]);
    setMensaje("");
    setError("");
  };

  const seleccionarAsiento = (asiento) => {
    if (reserva) return;

    if (asiento.estado_asiento !== "disponible") return;

    const yaSeleccionado = asientosSeleccionados.some(
      (item) => item.id_asiento === asiento.id_asiento
    );

    if (yaSeleccionado) {
      setAsientosSeleccionados((prev) =>
        prev.filter((item) => item.id_asiento !== asiento.id_asiento)
      );
      return;
    }

    if (asientosSeleccionados.length >= MAX_ASIENTOS) {
      setError(`Solo puedes seleccionar máximo ${MAX_ASIENTOS} asientos`);
      return;
    }

    setError("");
    setAsientosSeleccionados((prev) => [...prev, asiento]);
  };

  const crearReserva = async () => {
    setReservando(true);
    setMensaje("");
    setError("");

    try {
      const response = await fetch(`${API_URL}/cliente/reservas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id_concierto: Number(id),
          asientos: asientosSeleccionados.map((asiento) => asiento.id_asiento),
        }),
      });

      const data = await response.json();

      if (!data.ok) {
        setError(data.mensaje || "Error al crear reserva");
        return;
      }

      setReserva(data.reserva);
      setMensaje("Reserva creada correctamente. Tienes 10 minutos para pagar.");
      cargarAsientos();
    } catch (error) {
      setError("Error de conexión al crear reserva");
    } finally {
      setReservando(false);
    }
  };

  const cancelarReserva = async () => {
    if (!reserva) return;

    setMensaje("");
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/cliente/reservas/${reserva.id_reserva}/cancelar`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!data.ok) {
        setError(data.mensaje || "Error al cancelar reserva");
        return;
      }

      setReserva(null);
      setAsientosSeleccionados([]);
      setMensaje("Reserva cancelada correctamente");
      cargarAsientos();
    } catch (error) {
      setError("Error de conexión al cancelar reserva");
    }
  };

  const continuarPago = () => {
    if (!reserva) return;

    navigate(`/cliente/pago/${reserva.id_reserva}`, {
      state: {
        reserva,
        evento,
        asientos: asientosSeleccionados,
        total,
      },
    });
  };

  const obtenerClaseAsiento = (asiento) => {
    const seleccionado = asientosSeleccionados.some(
      (item) => item.id_asiento === asiento.id_asiento
    );

    if (seleccionado) return "asiento asiento-seleccionado";

    return `asiento asiento-${asiento.estado_asiento}`;
  };

  if (loading) {
    return (
      <>
        <ClienteNavbar />
        <main className="seleccion-page">
          <div className="seleccion-message">Cargando asientos...</div>
        </main>
        <ClienteFooter />
      </>
    );
  }

  return (
    <>
      <ClienteNavbar />

      <main className="seleccion-page">
        <section className="seleccion-header">
          <div>
            <h1>Selecciona tus asientos</h1>

            {evento && (
              <p>
                {evento.nombre_concierto} · {evento.nombre_artista} ·{" "}
                {evento.fecha?.split("T")[0]} · {evento.hora}
              </p>
            )}
          </div>

          {reserva && (
            <div className="contador-reserva">
              <span>Tiempo para pagar</span>
              <strong>{formatearTiempo(segundosRestantes)}</strong>
            </div>
          )}
        </section>

        {mensaje && <div className="seleccion-success">{mensaje}</div>}
        {error && <div className="seleccion-error">{error}</div>}

        <section className="seleccion-layout">
          <div className="seleccion-mapa-card">
            <div className="zona-tabs">
              {zonas.map((zona) => (
                <button
                  key={zona.id_zona}
                  className={
                    zonaSeleccionada?.id_zona === zona.id_zona
                      ? "zona-tab zona-tab-activa"
                      : "zona-tab"
                  }
                  onClick={() => seleccionarZona(zona)}
                  disabled={!!reserva}
                >
                  {zona.nombre_zona}
                  <span>${Number(zona.precio_zona).toFixed(2)}</span>
                </button>
              ))}
            </div>

            <div className="leyenda-asientos">
              <span><b className="color disponible"></b>Disponible</span>
              <span><b className="color reservado"></b>Reservado</span>
              <span><b className="color vendido"></b>Vendido</span>
              <span><b className="color seleccionado"></b>Seleccionado</span>
              <span><b className="color inhabilitado"></b>Inhabilitado</span>
            </div>

            <div className="estadio-box">
              <div className="escenario">Escenario / Campo</div>

              <div className="asientos-grid">
                {asientosZona.map((asiento) => (
                  <button
                    key={asiento.id_asiento}
                    className={obtenerClaseAsiento(asiento)}
                    onClick={() => seleccionarAsiento(asiento)}
                    disabled={
                      asiento.estado_asiento !== "disponible" || !!reserva
                    }
                    title={`${asiento.codigo_svg} - ${asiento.estado_asiento}`}
                  >
                    {asiento.numero_asiento}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <aside className="resumen-compra">
            <h2>Resumen de selección</h2>

            <div className="resumen-evento">
              <p>
                <strong>Evento:</strong> {evento?.nombre_concierto}
              </p>

              <p>
                <strong>Zona:</strong>{" "}
                {zonaSeleccionada ? zonaSeleccionada.nombre_zona : "No seleccionada"}
              </p>

              <p>
                <strong>Máximo permitido:</strong> {MAX_ASIENTOS} asientos
              </p>
            </div>

            <div className="resumen-lista">
              {asientosSeleccionados.length === 0 ? (
                <p className="resumen-vacio">No has seleccionado asientos.</p>
              ) : (
                asientosSeleccionados.map((asiento) => (
                  <div className="resumen-item" key={asiento.id_asiento}>
                    <div>
                      <strong>{asiento.codigo_svg}</strong>
                      <span>{asiento.nombre_zona}</span>
                    </div>

                    <strong>${Number(asiento.precio_zona).toFixed(2)}</strong>
                  </div>
                ))
              )}
            </div>

            <div className="resumen-total">
              <span>Total</span>
              <strong>${total.toFixed(2)}</strong>
            </div>

            {!reserva ? (
              <button
                className="btn-reservar"
                disabled={asientosSeleccionados.length === 0 || reservando}
                onClick={crearReserva}
              >
                {reservando ? "Reservando..." : "Reservar y continuar"}
              </button>
            ) : (
              <>
                <button className="btn-pagar" onClick={continuarPago}>
                  Pagar ahora
                </button>

                <button className="btn-cancelar-reserva" onClick={cancelarReserva}>
                  Cancelar reserva
                </button>
              </>
            )}

            <p className="resumen-nota">
              Los asientos seleccionados se reservarán durante 10 minutos.
            </p>
          </aside>
        </section>
      </main>

      <ClienteFooter />
    </>
  );
};

export default SeleccionAsiento;