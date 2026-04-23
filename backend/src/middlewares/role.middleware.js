const verificarRol = (...rolesPermitidos) => {
  return (req, res, next) => {
    try {
      const rolUsuario = req.usuario?.rol

      if (!rolUsuario) {
        return res.status(401).json({
          ok: false,
          mensaje: 'Rol no encontrado en el token'
        })
      }

      if (!rolesPermitidos.includes(rolUsuario)) {
        return res.status(403).json({
          ok: false,
          mensaje: 'No tienes permisos para acceder a esta ruta'
        })
      }

      next()
    } catch (error) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al validar rol'
      })
    }
  }
}

module.exports = {
  verificarRol
}