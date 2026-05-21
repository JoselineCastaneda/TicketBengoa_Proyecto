import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import ClienteNavbar from "../../components/cliente/ClienteNavbar";
import Estadio from "../../components/cliente/Estadio";
import { obtenerToken } from "../../auth/auth";

import "../../styles/cliente/seleccionAsientos.css";

const API_URL = "http://localhost:3000/api";
const MAX_ASIENTOS = 6;
const REFRESCO_MS = 10000;

const SeleccionAsiento = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const estadioBoxRef = useRef(null);
  const contadorRef = useRef(null);

  const [evento, setEvento] = useState(null);
  const [zonas, setZonas] = useState([]);
  const [asientos, setAsientos] = useState([]);
  const [zonaSeleccionada, setZonaSeleccionada] = useState(null);
  const [enfoqueZona, setEnfoqueZona] = useState(0);

  const [asientosSeleccionados, setAsientosSeleccionados] = useState([]);
  const [reserva, setReserva] = useState(null);
  const [segundosRestantes, setSegundosRestantes] = useState(0);

  const [loading, setLoading] = useState(true);
  const [reservando, setReservando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const token = obtenerToken();
  const reservaStorageKey = `reserva_activa_evento_${id}`;

  const guardarReservaLocal = (reservaActiva, asientosReserva) => {
    localStorage.setItem(
      reservaStorageKey,
      JSON.stringify({
        reserva: reservaActiva,
        asientos: asientosReserva,
      })
    );
  };

  const limpiarReservaLocal = () => {
    localStorage.removeItem(reservaStorageKey);
  };

  const cargarReservaLocal = () => {
    const data = localStorage.getItem(reservaStorageKey);
    if (!data) return null;

    try {
      const reservaGuardada = JSON.parse(data);

      if (!reservaGuardada?.reserva?.fecha_expiracion) {
        limpiarReservaLocal();
        return null;
      }

      const expiracion = new Date(
        reservaGuardada.reserva.fecha_expiracion
      ).getTime();

      if (expiracion <= Date.now()) {
        limpiarReservaLocal();
        return null;
      }

      return reservaGuardada;
    } catch {
      limpiarReservaLocal();
      return null;
    }
  };

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

      setZonaSeleccionada((zonaActual) => {
        if (zonaActual) {
          const mismaZona = data.zonas.find(
            (zona) => zona.id_zona === zonaActual.id_zona
          );

          return mismaZona || zonaActual;
        }

        return data.zonas.length > 0 ? data.zonas[0] : null;
      });

      const reservaGuardada = cargarReservaLocal();

      if (reservaGuardada && !reserva) {
        setReserva(reservaGuardada.reserva);
        setAsientosSeleccionados(reservaGuardada.asientos || []);
      }
    } catch (err) {
      setError("Error de conexión");
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

  const actualizarTiempo = () => {
    const ahora = new Date().getTime();
    const expiracion = new Date(reserva.fecha_expiracion).getTime();

    const diferencia = Math.max(Math.floor((expiracion - ahora) / 1000), 0);

    setSegundosRestantes(diferencia);

    if (diferencia === 0) {
      setReserva(null);
      setSegundosRestantes(0);
      setAsientosSeleccionados([]);
      setMensaje("");
      limpiarReservaLocal();
      cargarAsientos();
    }
  };

  actualizarTiempo();

  const intervalo = setInterval(actualizarTiempo, 1000);

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

  const seleccionarZona = (zona) => {
    setZonaSeleccionada(zona);

    if (!reserva) {
      setAsientosSeleccionados([]);
    }

    setTimeout(() => {
      setEnfoqueZona((prev) => prev + 1);

      estadioBoxRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 80);
  };

  const seleccionarAsiento = (asiento) => {
    if (reserva) return;
    if (asiento.estado_asiento !== "disponible") return;

    const existe = asientosSeleccionados.some(
      (item) => item.id_asiento === asiento.id_asiento
    );

    if (existe) {
      setAsientosSeleccionados((prev) =>
        prev.filter((item) => item.id_asiento !== asiento.id_asiento)
      );
      return;
    }

    if (asientosSeleccionados.length >= MAX_ASIENTOS) {
      setError(`Máximo ${MAX_ASIENTOS} asientos`);
      return;
    }

    setError("");
    setAsientosSeleccionados((prev) => [...prev, asiento]);
  };

  const crearReserva = async () => {
    try {
      setReservando(true);
      setError("");

      const response = await fetch(`${API_URL}/cliente/reservas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id_concierto: Number(id),
          asientos: asientosSeleccionados.map((a) => a.id_asiento),
        }),
      });

      const data = await response.json();

      if (!data.ok) {
        const reservaGuardada = cargarReservaLocal();

        if (reservaGuardada) {
          setReserva(reservaGuardada.reserva);
          setAsientosSeleccionados(reservaGuardada.asientos || []);
        }

        setError(data.mensaje || "Error al reservar");
        return;
      }

      setReserva(data.reserva);
      guardarReservaLocal(data.reserva, asientosSeleccionados);

      setMensaje("Reserva creada correctamente. Tienes 10 minutos para pagar.");

      setTimeout(() => {
        contadorRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 150);

      cargarAsientos();
    } catch (err) {
      setError("Error de conexión");
    } finally {
      setReservando(false);
    }
  };

  const cancelarReserva = async () => {
  if (!reserva) return;

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
      setError(data.mensaje || "Error al cancelar");
      return;
    }

    setReserva(null);
    setSegundosRestantes(0);
    setAsientosSeleccionados([]);
    setMensaje("");
    setError("");
    limpiarReservaLocal();

    await cargarAsientos();
  } catch (err) {
    setError("Error de conexión");
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

  const formatearTiempo = (segundos) => {
    const min = Math.floor(segundos / 60);
    const sec = segundos % 60;

    return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <>
        <ClienteNavbar />
        <main className="seleccion-page">
          <div className="seleccion-message">Cargando asientos...</div>
        </main>
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
            <div ref={contadorRef} className="contador-reserva">
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
                >
                  {zona.nombre_zona}
                  <span>${Number(zona.precio_zona).toFixed(2)}</span>
                </button>
              ))}
            </div>

            <div ref={estadioBoxRef} className="estadio-box estadio-box-svg">
              <Estadio
                asientos={asientos}
                asientosZona={asientosZona}
                zonaSeleccionada={zonaSeleccionada}
                enfoqueZona={enfoqueZona}
                asientosSeleccionados={asientosSeleccionados}
                reservaActiva={!!reserva}
                maxSeleccion={MAX_ASIENTOS}
                onSeleccionarAsiento={seleccionarAsiento}
              />
            </div>

            <div className="leyenda-asientos">
              <span>
                <b className="color disponible"></b>
                Disponible
              </span>

              <span>
                <b className="color reservado"></b>
                Reservado
              </span>

              <span>
                <b className="color vendido"></b>
                Vendido
              </span>

              <span>
                <b className="color seleccionado"></b>
                Seleccionado
              </span>
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
                {zonaSeleccionada
                  ? zonaSeleccionada.nombre_zona
                  : "No seleccionada"}
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

                <button
                  className="btn-cancelar-reserva"
                  onClick={cancelarReserva}
                >
                  Cancelar reserva
                </button>
              </>
            )}

            <p className="resumen-nota">
              Tus asientos se reservarán durante 10 minutos
            </p>
          </aside>
        </section>
      </main>
    </>
  );
};

export default SeleccionAsiento;