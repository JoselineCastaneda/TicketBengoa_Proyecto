const pool = require('../config/db')
const bcrypt = require('bcrypt')

const getUsuarios = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        u.id_usuario,
        u.nombre,
        u.apellido,
        u.correo_electronico,
        u.estado,
        u.fecha_registro,
        r.id_rol,
        r.nombre_rol AS rol
      FROM usuarios u
      INNER JOIN roles r
        ON u.id_rol = r.id_rol
      ORDER BY u.id_usuario DESC
    `)

    res.json({
      ok: true,
      usuarios: result.rows
    })
  } catch (error) {
    console.error('Error al obtener usuarios:', error)
    res.status(500).json({
      ok: false,
      mensaje: 'Error al obtener usuarios'
    })
  }
}

const createUsuarioAdmin = async (req, res) => {
  try {
    const {
      nombre,
      apellido,
      correo_electronico,
      contrasena,
      rol
    } = req.body

    if (!nombre || !apellido || !correo_electronico || !contrasena || !rol) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Todos los campos son obligatorios'
      })
    }

    if (!['administrador', 'validador'].includes(rol)) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Solo se pueden crear usuarios administrador o validador'
      })
    }

    if (contrasena.length < 6) {
      return res.status(400).json({
        ok: false,
        mensaje: 'La contraseña debe tener al menos 6 caracteres'
      })
    }

    const existe = await pool.query(
      `
      SELECT id_usuario
      FROM usuarios
      WHERE correo_electronico = $1
      LIMIT 1
      `,
      [correo_electronico]
    )

    if (existe.rows.length > 0) {
      return res.status(409).json({
        ok: false,
        mensaje: 'Este correo ya está registrado'
      })
    }

    const rolResult = await pool.query(
      `
      SELECT id_rol
      FROM roles
      WHERE nombre_rol = $1
      LIMIT 1
      `,
      [rol]
    )

    if (rolResult.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        mensaje: 'El rol seleccionado no existe'
      })
    }

    const hash = await bcrypt.hash(contrasena, 10)

    const result = await pool.query(
      `
      INSERT INTO usuarios (
        nombre,
        apellido,
        correo_electronico,
        contrasena_hash,
        id_rol,
        estado
      )
      VALUES ($1, $2, $3, $4, $5, 'activo')
      RETURNING id_usuario, nombre, apellido, correo_electronico, estado
      `,
      [
        nombre,
        apellido,
        correo_electronico,
        hash,
        rolResult.rows[0].id_rol
      ]
    )

    res.status(201).json({
      ok: true,
      mensaje: 'Usuario creado correctamente',
      usuario: {
        ...result.rows[0],
        rol
      }
    })
  } catch (error) {
    console.error('Error al crear usuario:', error)
    res.status(500).json({
      ok: false,
      mensaje: 'Error al crear usuario'
    })
  }
}

const updateUsuarioEstado = async (req, res) => {
  try {
    const { id_usuario } = req.params
    const { estado } = req.body

    if (!['activo', 'inactivo', 'bloqueado'].includes(estado)) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Estado inválido'
      })
    }

    const result = await pool.query(
      `
      UPDATE usuarios
      SET estado = $1
      WHERE id_usuario = $2
      RETURNING id_usuario, nombre, apellido, correo_electronico, estado
      `,
      [estado, id_usuario]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        mensaje: 'Usuario no encontrado'
      })
    }

    res.json({
      ok: true,
      mensaje: 'Estado actualizado correctamente',
      usuario: result.rows[0]
    })
  } catch (error) {
    console.error('Error al actualizar estado:', error)
    res.status(500).json({
      ok: false,
      mensaje: 'Error al actualizar estado'
    })
  }
}

module.exports = {
  getUsuarios,
  createUsuarioAdmin,
  updateUsuarioEstado
}