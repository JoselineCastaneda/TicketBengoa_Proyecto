import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Registro from "./pages/Registro";
import Recuperar from "./pages/Recuperar";

import Admin from "./pages/admin/Admin";
import Validador from "./pages/Validador";

import ClienteHome from "./pages/cliente/ClienteHome";
import DetalleEvento from "./pages/cliente/DetalleEvento";

import ProtectedRoute from "./components/ProtectedRoute";
import SeleccionAsiento from "./pages/cliente/SeleccionAsiento";

import Pago from "./pages/cliente/Pago";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* REDIRECCIÓN INICIAL */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* AUTENTICACIÓN */}
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/recuperar" element={<Recuperar />} />

        {/* ADMIN */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute rolPermitido="administrador">
              <Admin />
            </ProtectedRoute>
          }
        />

        {/* CLIENTE */}
        <Route
          path="/cliente"
          element={
            <ProtectedRoute rolPermitido="cliente">
              <ClienteHome />
            </ProtectedRoute>
          }
        />

        <Route
          path="/cliente/eventos/:id"
          element={
            <ProtectedRoute rolPermitido="cliente">
              <DetalleEvento />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/cliente/eventos/:id/asientos"
          element={
            <ProtectedRoute rolPermitido="cliente">
              <SeleccionAsiento />
            </ProtectedRoute>
          }
        />

        <Route
          path="/cliente/pago/:idReserva"
          element={
            <ProtectedRoute rolPermitido="cliente">
              <Pago />
            </ProtectedRoute>
          }
        />

        {/* VALIDADOR */}
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