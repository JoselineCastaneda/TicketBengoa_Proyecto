import { useNavigate } from "react-router-dom";
import { cerrarSesion, obtenerUsuarioActivo } from "../auth/auth";

const Cliente = () => {
  const navigate = useNavigate();
  const usuario = obtenerUsuarioActivo();

  const handleLogout = () => {
    cerrarSesion();
    navigate("/login");
  };

  return (
    <div style={{ padding: "30px" }}>
      <h1>Panel de Cliente</h1>
      <p>Bienvenida: {usuario?.nombre} {usuario?.apellido}</p>
      <button onClick={handleLogout}>Cerrar sesión</button>
    </div>
  );
};

export default Cliente;