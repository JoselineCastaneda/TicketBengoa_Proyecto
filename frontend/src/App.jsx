import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Registro from "./pages/Registro";
import Recuperar from "./pages/Recuperar";
import Admin from "./pages/Admin";
import Cliente from "./pages/Cliente";
import Validador from "./pages/Validador";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/recuperar" element={<Recuperar />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute rolPermitido="administrador">
              <Admin />
            </ProtectedRoute>
          }
        />

        <Route
          path="/cliente"
          element={
            <ProtectedRoute rolPermitido="cliente">
              <Cliente />
            </ProtectedRoute>
          }
        />

        <Route
          path="/validador"
          element={
            <ProtectedRoute rolPermitido="validador">
              <Validador />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;