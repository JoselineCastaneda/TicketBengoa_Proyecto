const API_URL = "http://localhost:3000/api/auth";

// LOGIN
export const loginUsuario = async (correo_electronico, contrasena) => {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        correo_electronico,
        contrasena,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        ok: false,
        mensaje: data.mensaje,
      };
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("usuarioActivo", JSON.stringify(data.usuario));

    return {
      ok: true,
      usuario: data.usuario,
    };
  } catch (error) {
    return {
      ok: false,
      mensaje: "Error de conexión",
    };
  }
};

// REGISTRO
export const registrarUsuario = async (
  nombre,
  apellido,
  correo_electronico,
  contrasena
) => {
  try {
    const response = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nombre,
        apellido,
        correo_electronico,
        contrasena,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        ok: false,
        mensaje: data.mensaje,
      };
    }

    return {
      ok: true,
      mensaje: data.mensaje,
    };
  } catch (error) {
    return {
      ok: false,
      mensaje: "Error de conexión",
    };
  }
};

// RECUPERAR PASSWORD
export const recuperarPassword = async (
  correo_electronico,
  nueva_contrasena
) => {
  try {
    const response = await fetch(`${API_URL}/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        correo_electronico,
        nueva_contrasena,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        ok: false,
        mensaje: data.mensaje,
      };
    }

    return {
      ok: true,
      mensaje: data.mensaje,
    };
  } catch (error) {
    return {
      ok: false,
      mensaje: "Error de conexión",
    };
  }
};

// SESIÓN
export const cerrarSesion = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("usuarioActivo");
};

export const obtenerUsuarioActivo = () => {
  return JSON.parse(localStorage.getItem("usuarioActivo"));
};

export const obtenerToken = () => {
  return localStorage.getItem("token");
};