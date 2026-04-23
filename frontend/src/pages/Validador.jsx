import { useNavigate } from "react-router-dom";
import { cerrarSesion, obtenerUsuarioActivo } from "../auth/auth";

const Validador = () => {
  const navigate = useNavigate();
  const usuario = obtenerUsuarioActivo();

  const handleLogout = () => {
    cerrarSesion();
    navigate("/login");
  };

  return (
    <div style={{ padding: "30px" }}>
      <h1>Panel de Validador</h1>
      <p>Bienvenida: {usuario?.nombre} {usuario?.apellido}</p>
      <button onClick={handleLogout}>Cerrar sesión</button>
    </div>
  );
};

export default Validador;