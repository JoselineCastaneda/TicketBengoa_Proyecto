import { useEffect, useState } from "react";

import {
  obtenerToken,
  obtenerUsuarioActivo,
} from "../auth/auth";

const API_URL = "http://localhost:3000/api";

const usuarioFormInicial = {
  nombre: "",
  apellido: "",
  correo_electronico: "",
  contrasena: "",
  confirmar_contrasena: "",
  rol: "validador",
};

export const useUsuariosAdmin = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroRol, setFiltroRol] = useState("todos");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [paginaActual, setPaginaActual] = useState(1);

  const [form, setForm] = useState(usuarioFormInicial);

  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const usuariosPorPagina = 6;

  const token = obtenerToken();

  const usuarioActivo = obtenerUsuarioActivo();

  const obtenerUsuarios = async () => {
    try {
      const response = await fetch(
        `${API_URL}/usuarios`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (data.ok) {
        setUsuarios(data.usuarios);
      }
    } catch {
      setError("Error al cargar usuarios");
    }
  };

  useEffect(() => {
    obtenerUsuarios();
  }, []);

  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda, filtroRol, filtroEstado]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const limpiarFormulario = () => {
    setForm(usuarioFormInicial);
  };

  const crearUsuario = async () => {
    setMensaje("");
    setError("");

    if (
      !form.nombre ||
      !form.apellido ||
      !form.correo_electronico ||
      !form.contrasena ||
      !form.confirmar_contrasena ||
      !form.rol
    ) {
      setError("Todos los campos son obligatorios");
      return;
    }

    if (form.contrasena.length < 6) {
      setError(
        "La contraseña debe tener al menos 6 caracteres"
      );
      return;
    }

    if (
      form.contrasena !==
      form.confirmar_contrasena
    ) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        nombre: form.nombre,
        apellido: form.apellido,
        correo_electronico:
          form.correo_electronico,
        contrasena: form.contrasena,
        rol: form.rol,
      };

      const response = await fetch(
        `${API_URL}/usuarios`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!data.ok) {
        setError(
          data.mensaje ||
            "Error al crear usuario"
        );
        return;
      }

      setMensaje(
        "Usuario creado correctamente"
      );

      limpiarFormulario();

      obtenerUsuarios();
    } catch {
      setError("Error al crear usuario");
    } finally {
      setLoading(false);
    }
  };

  const cambiarEstado = async (
    usuario,
    estadoNuevo
  ) => {
    setMensaje("");
    setError("");

    if (
      Number(usuarioActivo?.id_usuario) ===
      Number(usuario.id_usuario)
    ) {
      setError(
        "No puedes cambiar el estado de tu propio usuario"
      );

      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/usuarios/${usuario.id_usuario}/estado`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            estado: estadoNuevo,
          }),
        }
      );

      const data = await response.json();

      if (!data.ok) {
        setError(
          data.mensaje ||
            "Error al actualizar estado"
        );

        return;
      }

      setMensaje(
        "Estado actualizado correctamente"
      );

      obtenerUsuarios();
    } catch {
      setError(
        "Error al actualizar estado"
      );
    }
  };

  const obtenerIniciales = (usuario) => {
    const nombre =
      usuario.nombre?.charAt(0) || "";

    const apellido =
      usuario.apellido?.charAt(0) || "";

    return (
      `${nombre}${apellido}`.toUpperCase() ||
      "U"
    );
  };

  const usuariosFiltrados = usuarios.filter(
    (usuario) => {
      const texto = `
        ${usuario.nombre || ""}
        ${usuario.apellido || ""}
        ${usuario.correo_electronico || ""}
        ${usuario.rol || ""}
        ${usuario.estado || ""}
      `.toLowerCase();

      const coincideBusqueda = texto.includes(
        busqueda.toLowerCase()
      );

      const coincideRol =
        filtroRol === "todos" ||
        usuario.rol === filtroRol;

      const coincideEstado =
        filtroEstado === "todos" ||
        usuario.estado === filtroEstado;

      return (
        coincideBusqueda &&
        coincideRol &&
        coincideEstado
      );
    }
  );

  const totalPaginas = Math.ceil(
    usuariosFiltrados.length /
      usuariosPorPagina
  );

  const indiceFinal =
    paginaActual * usuariosPorPagina;

  const indiceInicio =
    indiceFinal - usuariosPorPagina;

  const usuariosPaginados =
    usuariosFiltrados.slice(
      indiceInicio,
      indiceFinal
    );

  const usuariosStats = {
    total: usuarios.length,

    administradores: usuarios.filter(
      (usuario) =>
        usuario.rol === "administrador"
    ).length,

    validadores: usuarios.filter(
      (usuario) =>
        usuario.rol === "validador"
    ).length,

    clientes: usuarios.filter(
      (usuario) =>
        usuario.rol === "cliente"
    ).length,
  };

  return {
    usuariosStats,

    busqueda,
    setBusqueda,

    filtroRol,
    setFiltroRol,

    filtroEstado,
    setFiltroEstado,

    paginaActual,
    setPaginaActual,

    totalPaginas,
    indiceFinal,
    indiceInicio,

    usuariosFiltrados,
    usuariosPaginados,

    form,
    handleChange,

    loading,

    crearUsuario,

    mensaje,
    error,

    usuarioActivo,

    obtenerIniciales,

    cambiarEstado,
  };
};