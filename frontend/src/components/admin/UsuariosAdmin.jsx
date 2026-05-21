import { FiShield, FiUser, FiUserCheck, FiUsers } from "react-icons/fi";

import AdminStatCard from "./usuarios/AdminStatCard";
import AdminFilterBar from "./usuarios/AdminFilterBar";
import AdminPagination from "./usuarios/AdminPagination";
import UsuariosTable from "./usuarios/UsuariosTable";
import UsuariosForm from "./usuarios/UsuariosForm";

import { useUsuariosAdmin } from "../../hooks/useUsuariosAdmin";

import "../../styles/admin/usuarios.css";

const filtrosUsuarios = [
  {
    name: "rol",
    options: [
      { value: "todos", label: "Todos los roles" },
      { value: "administrador", label: "Administradores" },
      { value: "validador", label: "Validadores" },
      { value: "cliente", label: "Clientes" },
    ],
  },
  {
    name: "estado",
    options: [
      { value: "todos", label: "Todos los estados" },
      { value: "activo", label: "Activos" },
      { value: "inactivo", label: "Inactivos" },
      { value: "bloqueado", label: "Bloqueados" },
    ],
  },
];

const UsuariosAdmin = () => {
  const {
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
  } = useUsuariosAdmin();

  return (
    <section className="usuarios-admin-page">
      <header className="usuarios-header">
        <div>
          <span className="usuarios-eyebrow">Administración</span>

          <h1>Gestión de Usuarios</h1>

          <p>Administra usuarios, roles y estados dentro del sistema.</p>
        </div>
      </header>

      <section className="usuarios-stats-grid">
        <AdminStatCard
          icon={FiUsers}
          title="Total usuarios"
          value={usuariosStats.total}
          color="purple"
        />

        <AdminStatCard
          icon={FiShield}
          title="Administradores"
          value={usuariosStats.administradores}
          color="blue"
        />

        <AdminStatCard
          icon={FiUserCheck}
          title="Validadores"
          value={usuariosStats.validadores}
          color="green"
        />

        <AdminStatCard
          icon={FiUser}
          title="Clientes"
          value={usuariosStats.clientes}
          color="pink"
        />
      </section>

      <AdminFilterBar
        searchValue={busqueda}
        onSearchChange={setBusqueda}
        searchPlaceholder="Buscar por nombre, correo, rol o estado..."
        resultText={`${usuariosFiltrados.length} usuarios`}
        filters={[
          {
            ...filtrosUsuarios[0],
            value: filtroRol,
            onChange: setFiltroRol,
          },
          {
            ...filtrosUsuarios[1],
            value: filtroEstado,
            onChange: setFiltroEstado,
          },
        ]}
      />

      {mensaje && <p className="admin-success">{mensaje}</p>}
      {error && <p className="admin-error">{error}</p>}

      <section className="usuarios-content-layout">
        <div className="usuarios-table-card">
          <UsuariosTable
            usuarios={usuariosPaginados}
            usuariosFiltradosLength={usuariosFiltrados.length}
            usuarioActivo={usuarioActivo}
            obtenerIniciales={obtenerIniciales}
            cambiarEstado={cambiarEstado}
          />

          <AdminPagination
            currentPage={paginaActual}
            totalPages={totalPaginas}
            startIndex={indiceInicio}
            endIndex={indiceFinal}
            totalItems={usuariosFiltrados.length}
            itemLabel="usuarios"
            onPrevious={() => setPaginaActual((prev) => prev - 1)}
            onNext={() => setPaginaActual((prev) => prev + 1)}
          />
        </div>

        <UsuariosForm
          form={form}
          loading={loading}
          handleChange={handleChange}
          crearUsuario={crearUsuario}
        />
      </section>
    </section>
  );
};

export default UsuariosAdmin;