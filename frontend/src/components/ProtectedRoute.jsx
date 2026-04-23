import { Navigate } from "react-router-dom";
import { obtenerUsuarioActivo, obtenerToken } from "../auth/auth";

const ProtectedRoute = ({ children, rolPermitido }) => {
  const token = obtenerToken();
  const usuario = obtenerUsuarioActivo();

  if (!token || !usuario) {
    return <Navigate to="/login" replace />;
  }

  if (rolPermitido && usuario.rol !== rolPermitido) {
    if (usuario.rol === "administrador") {
      return <Navigate to="/admin" replace />;
    }

    if (usuario.rol === "cliente") {
      return <Navigate to="/cliente" replace />;
    }

    if (usuario.rol === "validador") {
      return <Navigate to="/validador" replace />;
    }

    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;