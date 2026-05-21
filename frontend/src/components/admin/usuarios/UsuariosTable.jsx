const UsuariosTable = ({
  usuarios,
  usuariosFiltradosLength,
  usuarioActivo,
  obtenerIniciales,
  cambiarEstado,
}) => {
  return (
    <table className="usuarios-table">
      <thead>
        <tr>
          <th>Usuario</th>
          <th>Correo</th>
          <th>Rol</th>
          <th>Estado</th>
          <th>Fecha registro</th>
          <th>Cambiar estado</th>
        </tr>
      </thead>

      <tbody>
        {usuarios.map((usuario) => (
          <tr key={usuario.id_usuario}>
            <td>
              <div className="usuario-info">
                <div className={`usuario-avatar rol-${usuario.rol}`}>
                  {obtenerIniciales(usuario)}
                </div>

                <div>
                  <strong>
                    {usuario.nombre} {usuario.apellido}
                  </strong>
                  <small>@{usuario.nombre?.toLowerCase()}</small>
                </div>
              </div>
            </td>

            <td>{usuario.correo_electronico}</td>

            <td>
              <span className={`usuario-rol rol-${usuario.rol}`}>
                {usuario.rol}
              </span>
            </td>

            <td>
              <span className={`usuario-estado estado-${usuario.estado}`}>
                {usuario.estado}
              </span>
            </td>

            <td>
              {usuario.fecha_registro
                ? usuario.fecha_registro.split("T")[0]
                : ""}
            </td>

            <td>
              <select
                className="estado-select"
                value={usuario.estado}
                disabled={
                  Number(usuarioActivo?.id_usuario) ===
                  Number(usuario.id_usuario)
                }
                onChange={(e) => cambiarEstado(usuario, e.target.value)}
              >
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
                <option value="bloqueado">Bloqueado</option>
              </select>
            </td>
          </tr>
        ))}

        {usuariosFiltradosLength === 0 && (
          <tr>
            <td colSpan="6" className="tabla-vacia">
              No hay usuarios que coincidan con la búsqueda.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default UsuariosTable;