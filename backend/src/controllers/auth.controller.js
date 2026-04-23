const pool = require('../config/db')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const login = async (req, res) => {
  try {
    const { correo_electronico, contrasena } = req.body

    if (!correo_electronico || !contrasena) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Debes enviar correo_electronico y contrasena'
      })
    }

    const query = `
      SELECT 
        u.id_usuario,
        u.nombre,
        u.apellido,
        u.correo_electronico,
        u.contrasena_hash,
        u.estado,
        r.nombre_rol
      FROM usuarios u
      INNER JOIN roles r
        ON u.id_rol = r.id_rol
      WHERE u.correo_electronico = $1
      LIMIT 1
    `

    const result = await pool.query(query, [correo_electronico])

    if (result.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        mensaje: 'Usuario no encontrado'
      })
    }

    const usuario = result.rows[0]

    if (usuario.estado !== 'activo') {
      return res.status(403).json({
        ok: false,
        mensaje: 'Usuario no activo'
      })
    }

    const passwordValida = await bcrypt.compare(
      contrasena,
      usuario.contrasena_hash
    )

    if (!passwordValida) {
      return res.status(401).json({
        ok: false,
        mensaje: 'Contraseña incorrecta'
      })
    }

    const token = jwt.sign(
      {
        id_usuario: usuario.id_usuario,
        correo_electronico: usuario.correo_electronico,
        rol: usuario.nombre_rol
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    )

    return res.status(200).json({
      ok: true,
      mensaje: 'Login correcto',
      token,
      usuario: {
        id_usuario: usuario.id_usuario,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        correo_electronico: usuario.correo_electronico,
        estado: usuario.estado,
        rol: usuario.nombre_rol
      }
    })
  } catch (error) {
    console.error('Error en login:', error)
    return res.status(500).json({
      ok: false,
      mensaje: 'Error interno del servidor'
    })
  }
}

const register = async (req, res) => {
  try {
    const { nombre, apellido, correo_electronico, contrasena } = req.body

    if (!nombre || !apellido || !correo_electronico || !contrasena) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Todos los campos son obligatorios'
      })
    }

    if (contrasena.length < 6) {
      return res.status(400).json({
        ok: false,
        mensaje: 'La contraseña debe tener al menos 6 caracteres'
      })
    }

    const existeQuery = `
      SELECT id_usuario
      FROM usuarios
      WHERE correo_electronico = $1
      LIMIT 1
    `
    const existeResult = await pool.query(existeQuery, [correo_electronico])

    if (existeResult.rows.length > 0) {
      return res.status(409).json({
        ok: false,
        mensaje: 'Este correo ya está registrado'
      })
    }

    const rolClienteQuery = `
      SELECT id_rol
      FROM roles
      WHERE nombre_rol = 'cliente'
      LIMIT 1
    `
    const rolClienteResult = await pool.query(rolClienteQuery)

    if (rolClienteResult.rows.length === 0) {
      return res.status(500).json({
        ok: false,
        mensaje: 'No existe el rol cliente en la base de datos'
      })
    }

    const idRolCliente = rolClienteResult.rows[0].id_rol

    const hash = await bcrypt.hash(contrasena, 10)

    const insertQuery = `
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
    `

    const insertResult = await pool.query(insertQuery, [
      nombre,
      apellido,
      correo_electronico,
      hash,
      idRolCliente
    ])

    return res.status(201).json({
      ok: true,
      mensaje: 'Usuario registrado correctamente',
      usuario: {
        ...insertResult.rows[0],
        rol: 'cliente'
      }
    })
  } catch (error) {
    console.error('Error en register:', error)
    return res.status(500).json({
      ok: false,
      mensaje: 'Error interno del servidor'
    })
  }
}

const resetPassword = async (req, res) => {
  try {
    const { correo_electronico, nueva_contrasena } = req.body

    if (!correo_electronico || !nueva_contrasena) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Debes enviar correo_electronico y nueva_contrasena'
      })
    }

    if (nueva_contrasena.length < 6) {
      return res.status(400).json({
        ok: false,
        mensaje: 'La nueva contraseña debe tener al menos 6 caracteres'
      })
    }

    const usuarioQuery = `
      SELECT id_usuario
      FROM usuarios
      WHERE correo_electronico = $1
      LIMIT 1
    `
    const usuarioResult = await pool.query(usuarioQuery, [correo_electronico])

    if (usuarioResult.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        mensaje: 'El correo no está registrado'
      })
    }

    const hash = await bcrypt.hash(nueva_contrasena, 10)

    const updateQuery = `
      UPDATE usuarios
      SET contrasena_hash = $1
      WHERE correo_electronico = $2
    `
    await pool.query(updateQuery, [hash, correo_electronico])

    return res.status(200).json({
      ok: true,
      mensaje: 'Contraseña actualizada correctamente'
    })
  } catch (error) {
    console.error('Error en resetPassword:', error)
    return res.status(500).json({
      ok: false,
      mensaje: 'Error interno del servidor'
    })
  }
}

module.exports = {
  login,
  register,
  resetPassword
}