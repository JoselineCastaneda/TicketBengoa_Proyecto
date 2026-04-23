import { useNavigate } from "react-router-dom";
import { cerrarSesion, obtenerUsuarioActivo } from "../auth/auth";

const Admin = () => {
  const navigate = useNavigate();
  const usuario = obtenerUsuarioActivo();

  const handleLogout = () => {
    cerrarSesion();
    navigate("/login");
  };

  return (
    <div style={{ padding: "30px" }}>
      <h1>Panel de Administrador</h1>
      <p>Bienvenida: {usuario?.nombre} {usuario?.apellido}</p>
      <button onClick={handleLogout}>Cerrar sesión</button>
    </div>
  );
};

export default Admin;