const express = require("express");
const cors = require("cors");
const path = require("path");

const testRoutes = require("./routes/test.routes");
const authRoutes = require("./routes/auth.routes");
const protectedRoutes = require("./routes/protected.routes");
const artistaRoutes = require("./routes/artista.routes");
const conciertoRoutes = require("./routes/concierto.routes");
const zonaRoutes = require("./routes/zona.routes");
const usuarioRoutes = require("./routes/usuario.routes");
const clienteRoutes = require("./routes/cliente.routes");
const adminRoutes = require("./routes/admin.routes");
const validadorRoutes = require("./routes/validador.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.get("/", (req, res) => {
  res.json({
    mensaje: "API TicketBengoa funcionando correctamente",
  });
});

app.use("/api", testRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/protected", protectedRoutes);
app.use("/api/artistas", artistaRoutes);
app.use("/api/conciertos", conciertoRoutes);
app.use("/api/zonas", zonaRoutes);
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/cliente", clienteRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/validador", validadorRoutes);

module.exports = app;