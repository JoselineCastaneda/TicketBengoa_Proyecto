const bcrypt = require('bcrypt')

async function generarHash() {
  try {
    const password = 'Ticket1234'
    const hash = await bcrypt.hash(password, 10)

    console.log('Contraseña original:', password)
    console.log('Hash generado:', hash)
  } catch (error) {
    console.error('Error al generar hash:', error)
  }
}

generarHash()