import { useEffect, useRef, useState } from "react";
import "../../styles/cliente/Estadio.css";

function Estadio({
  asientos = [],
  zonaSeleccionada = null,
  enfoqueZona = 0,
  asientosSeleccionados = [],
  onSeleccionarAsiento,
  maxSeleccion = 6,
  reservaActiva = false,
}) {
  const objectRef = useRef(null);
  const viewportRef = useRef(null);

  const BASE_WIDTH = 900;
  const BASE_HEIGHT = 620;

  const ZOOM_MIN = 0.55;
  const ZOOM_MAX = 7;
  const ZOOM_STEP = 0.35;
  const DOBLE_CLICK_ZOOM = 0.8;

  const COLOR_SELECCIONADO = "#9333ea";

  const [svgListo, setSvgListo] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const zoomRef = useRef(1);
  const offsetRef = useRef({ x: 0, y: 0 });

  const dragRef = useRef(false);
  const dragMovedRef = useRef(false);

  const startMouseRef = useRef({ x: 0, y: 0 });
  const startOffsetRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  useEffect(() => {
    offsetRef.current = offset;
  }, [offset]);

  const obtenerFormasAsiento = (asientoSvg) => {
    const tag = asientoSvg.tagName.toLowerCase();

    if (["circle", "ellipse", "path", "rect", "polygon"].includes(tag)) {
      return [asientoSvg];
    }

    return Array.from(
      asientoSvg.querySelectorAll("circle, ellipse, path, rect, polygon")
    );
  };

  const centrarMapa = () => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const padding = 18;
    const zoomX = (viewport.clientWidth - padding * 2) / BASE_WIDTH;
    const zoomY = (viewport.clientHeight - padding * 2) / BASE_HEIGHT;
    const nuevoZoom = Math.max(Math.min(zoomX, zoomY, 1), ZOOM_MIN);

    setZoom(nuevoZoom);

    setOffset({
      x: Math.round((viewport.clientWidth - BASE_WIDTH * nuevoZoom) / 2),
      y: Math.round((viewport.clientHeight - BASE_HEIGHT * nuevoZoom) / 2),
    });
  };

  const aplicarZoom = (nuevoZoom) => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const centroX = viewport.clientWidth / 2;
    const centroY = viewport.clientHeight / 2;

    const mapaX = (centroX - offsetRef.current.x) / zoomRef.current;
    const mapaY = (centroY - offsetRef.current.y) / zoomRef.current;

    setZoom(nuevoZoom);

    setOffset({
      x: Math.round(centroX - mapaX * nuevoZoom),
      y: Math.round(centroY - mapaY * nuevoZoom),
    });
  };

  const aplicarZoomEnPunto = (nuevoZoom, clientX, clientY) => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const rect = viewport.getBoundingClientRect();
    const puntoX = clientX - rect.left;
    const puntoY = clientY - rect.top;

    const mapaX = (puntoX - offsetRef.current.x) / zoomRef.current;
    const mapaY = (puntoY - offsetRef.current.y) / zoomRef.current;

    setZoom(nuevoZoom);

    setOffset({
      x: Math.round(puntoX - mapaX * nuevoZoom),
      y: Math.round(puntoY - mapaY * nuevoZoom),
    });
  };

  const enfocarZona = (zona) => {
    const viewport = viewportRef.current;
    if (!viewport || !zona) return;

    const nombre = zona.nombre_zona
      ?.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();

    const zonasMapa = {
      "zona vip": { x: 250, y: 190, zoom: 3.3 },
      "zona ejecutiva": { x: 455, y: 185, zoom: 3.1 },
      "zona platinum": { x: 675, y: 185, zoom: 3.3 },
      "zona platium": { x: 675, y: 185, zoom: 2.35 },

      "bloque a": { x: 220, y: 330, zoom: 3.7 },
      "bloque b": { x: 340, y: 330, zoom: 3.7 },
      "bloque e": { x: 550, y: 360, zoom: 3.7 },
      "bloque f": { x: 670, y: 350, zoom: 3.7 },

      "zona general a": { x: 400, y: 490, zoom: 4.5 },
      "zona general b": { x: 490, y: 490, zoom: 4.5 },
      "general a": { x: 330, y: 500, zoom: 2.15 },
      "general b": { x: 560, y: 500, zoom: 2.15 },
    };

    const punto = zonasMapa[nombre];
    if (!punto) return;

    setZoom(punto.zoom);

    setOffset({
      x: Math.round(viewport.clientWidth / 2 - punto.x * punto.zoom),
      y: Math.round(viewport.clientHeight / 2 - punto.y * punto.zoom),
    });
  };

  useEffect(() => {
    if (!enfoqueZona || !zonaSeleccionada || !svgListo) return;
    enfocarZona(zonaSeleccionada);
  }, [enfoqueZona]);

  const iniciarArrastre = (screenX, screenY) => {
    dragRef.current = true;
    dragMovedRef.current = false;

    startMouseRef.current = { x: screenX, y: screenY };
    startOffsetRef.current = { ...offsetRef.current };
  };

  const moverMapa = (screenX, screenY) => {
    if (!dragRef.current) return;

    const dx = screenX - startMouseRef.current.x;
    const dy = screenY - startMouseRef.current.y;

    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
      dragMovedRef.current = true;
    }

    setOffset({
      x: Math.round(startOffsetRef.current.x + dx),
      y: Math.round(startOffsetRef.current.y + dy),
    });
  };

  const terminarArrastre = () => {
    dragRef.current = false;

    setTimeout(() => {
      dragMovedRef.current = false;
    }, 0);
  };

  const manejarTouchStart = (e) => {
    if (!e.touches || e.touches.length === 0) return;

    const touch = e.touches[0];
    iniciarArrastre(touch.screenX, touch.screenY);
  };

  const manejarTouchMove = (e) => {
    if (!e.touches || e.touches.length === 0) return;

    e.preventDefault();

    const touch = e.touches[0];
    moverMapa(touch.screenX, touch.screenY);
  };

  const manejarTouchEnd = () => {
    terminarArrastre();
  };

  const obtenerEstadoAsiento = (asiento) => {
    const seleccionado = asientosSeleccionados.some(
      (item) => item.id_asiento === asiento.id_asiento
    );

    if (seleccionado && reservaActiva) return "reservado";
    if (seleccionado) return "seleccionado";

    return asiento.estado_asiento;
  };

  const obtenerColorEstado = (estado) => {
    switch (estado) {
      case "seleccionado":
        return COLOR_SELECCIONADO;
      case "reservado":
        return "#facc15";
      case "vendido":
        return "#ef4444";
      case "disponible":
        return "#2563eb";
      default:
        return "#64748b";
    }
  };

  const aplicarEstiloAsiento = (asientoSvg, estado, disponible) => {
    const color = obtenerColorEstado(estado);
    const formas = obtenerFormasAsiento(asientoSvg);

    formas.forEach((forma) => {
      forma.setAttribute("fill", color);
      forma.setAttribute("stroke", color);

      forma.style.setProperty("fill", color, "important");
      forma.style.setProperty("stroke", color, "important");
      forma.style.setProperty("opacity", disponible ? "1" : "0.82", "important");
      forma.style.setProperty("filter", "none", "important");

      if (estado === "seleccionado") {
        forma.style.setProperty("stroke", "#e9d5ff", "important");
        forma.style.setProperty("stroke-width", "2", "important");
      } else if (estado === "reservado") {
        forma.style.setProperty("stroke", "#fff7ae", "important");
        forma.style.setProperty("stroke-width", "2", "important");
      } else {
        forma.style.setProperty("stroke-width", "1", "important");
      }
    });
  };

  const seleccionarDesdeSVG = (asiento) => {
    if (dragMovedRef.current) return;
    if (reservaActiva) return;
    if (asiento.estado_asiento !== "disponible") return;

    const yaSeleccionado = asientosSeleccionados.some(
      (item) => item.id_asiento === asiento.id_asiento
    );

    if (!yaSeleccionado && asientosSeleccionados.length >= maxSeleccion) {
      return;
    }

    onSeleccionarAsiento(asiento);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      centrarMapa();
    }, 80);

    window.addEventListener("resize", centrarMapa);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", centrarMapa);
    };
  }, []);

  useEffect(() => {
    const manejarMouseMove = (e) => {
      moverMapa(e.screenX, e.screenY);
    };

    const manejarMouseUp = () => {
      terminarArrastre();
    };

    window.addEventListener("mousemove", manejarMouseMove);
    window.addEventListener("mouseup", manejarMouseUp);

    return () => {
      window.removeEventListener("mousemove", manejarMouseMove);
      window.removeEventListener("mouseup", manejarMouseUp);
    };
  }, []);

  useEffect(() => {
    const objetoSVG = objectRef.current;
    if (!objetoSVG) return;

    const manejarCargaSVG = () => {
      const svgDoc = objetoSVG.contentDocument;
      if (!svgDoc) return;

      const svgWindow = svgDoc.defaultView;
      const svg = svgDoc.querySelector("svg");

      if (svg) {
        svg.style.cursor = "default";
        svg.style.shapeRendering = "geometricPrecision";
        svg.style.textRendering = "geometricPrecision";
        svg.style.touchAction = "none";

        svg.onmousedown = (e) => {
          e.preventDefault();
          e.stopPropagation();
          iniciarArrastre(e.screenX, e.screenY);
        };

        svg.ontouchstart = (e) => {
          e.preventDefault();
          e.stopPropagation();

          const touch = e.touches[0];
          iniciarArrastre(touch.screenX, touch.screenY);
        };

        svg.ontouchmove = (e) => {
          e.preventDefault();
          e.stopPropagation();

          const touch = e.touches[0];
          moverMapa(touch.screenX, touch.screenY);
        };

        svg.ontouchend = (e) => {
          e.preventDefault();
          e.stopPropagation();
          terminarArrastre();
        };

        svg.ondblclick = (e) => {
          e.preventDefault();
          e.stopPropagation();

          terminarArrastre();

          const objectRect = objectRef.current.getBoundingClientRect();

          aplicarZoomEnPunto(
            Math.min(zoomRef.current + DOBLE_CLICK_ZOOM, ZOOM_MAX),
            objectRect.left + e.clientX,
            objectRect.top + e.clientY
          );
        };
      }

      if (svgWindow) {
        svgWindow.onmousemove = (e) => {
          moverMapa(e.screenX, e.screenY);
        };

        svgWindow.onmouseup = () => {
          terminarArrastre();
        };

        svgWindow.ontouchmove = (e) => {
          e.preventDefault();

          const touch = e.touches[0];
          moverMapa(touch.screenX, touch.screenY);
        };

        svgWindow.ontouchend = () => {
          terminarArrastre();
        };
      }

      asientos.forEach((asiento) => {
        const asientoSvg = svgDoc.getElementById(asiento.codigo_svg);
        if (!asientoSvg) return;

        const estado = obtenerEstadoAsiento(asiento);
        const disponible = asiento.estado_asiento === "disponible";

        aplicarEstiloAsiento(asientoSvg, estado, disponible);

        asientoSvg.style.cursor =
          disponible && !reservaActiva ? "pointer" : "default";

        asientoSvg.style.pointerEvents = "auto";

        asientoSvg.onmousedown = (e) => {
          e.preventDefault();
          e.stopPropagation();
          iniciarArrastre(e.screenX, e.screenY);
        };

        asientoSvg.ontouchstart = (e) => {
          e.preventDefault();
          e.stopPropagation();

          const touch = e.touches[0];
          iniciarArrastre(touch.screenX, touch.screenY);
        };

        asientoSvg.ontouchmove = (e) => {
          e.preventDefault();
          e.stopPropagation();

          const touch = e.touches[0];
          moverMapa(touch.screenX, touch.screenY);
        };

        asientoSvg.ontouchend = (e) => {
          e.preventDefault();
          e.stopPropagation();
          terminarArrastre();
        };

        asientoSvg.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          seleccionarDesdeSVG(asiento);
        };
      });

      setSvgListo(true);
    };

    objetoSVG.addEventListener("load", manejarCargaSVG);

    if (objetoSVG.contentDocument) {
      manejarCargaSVG();
    }

    return () => {
      objetoSVG.removeEventListener("load", manejarCargaSVG);
    };
  }, [
    asientos,
    asientosSeleccionados,
    maxSeleccion,
    onSeleccionarAsiento,
    reservaActiva,
  ]);

  const aumentarZoom = (e) => {
    e.preventDefault();
    e.stopPropagation();

    aplicarZoom(Math.min(zoomRef.current + ZOOM_STEP, ZOOM_MAX));
  };

  const disminuirZoom = (e) => {
    e.preventDefault();
    e.stopPropagation();

    aplicarZoom(Math.max(zoomRef.current - ZOOM_STEP, ZOOM_MIN));
  };

  const resetZoom = (e) => {
    e.preventDefault();
    e.stopPropagation();

    centrarMapa();
  };

  const manejarDobleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    terminarArrastre();

    aplicarZoomEnPunto(
      Math.min(zoomRef.current + DOBLE_CLICK_ZOOM, ZOOM_MAX),
      e.clientX,
      e.clientY
    );
  };

  return (
    <div className="estadiob-root">
      <div className="estadiob-wrapper">
        <div className="estadiob-controls">
          <button
            type="button"
            onClick={aumentarZoom}
            disabled={zoom >= ZOOM_MAX}
          >
            +
          </button>

          <button
            type="button"
            onClick={disminuirZoom}
            disabled={zoom <= ZOOM_MIN}
          >
            −
          </button>

          <button type="button" onClick={resetZoom}>
            R
          </button>
        </div>

        <div
          ref={viewportRef}
          className="estadiob-viewport"
          onDoubleClick={manejarDobleClick}
          onTouchStart={manejarTouchStart}
          onTouchMove={manejarTouchMove}
          onTouchEnd={manejarTouchEnd}
        >
          <div
            className={`estadiob-stage ${
              svgListo ? "estadiob-stage-ready" : ""
            }`}
            style={{
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
              transformOrigin: "top left",
            }}
          >
            <object
              ref={objectRef}
              type="image/svg+xml"
              data="/estadio.svg"
              className="estadiob-svg"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Estadio;