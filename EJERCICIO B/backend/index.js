import express from "express";
import cors from "cors";
import { conectarDB } from "./db.js";
import usuariosRouter from "./usuarios.js";
import pacientesRouter from "./pacientes.js";
import turnosRouter from "./turnos.js";
import authRouter, { authConfig } from "./auth.js";

conectarDB();

const app = express();
const port = 3000;

app.use(express.json());

app.use(cors());

authConfig();

app.get("/", (req, res) => {
  res.send("Hola mundo!");
});

app.use("/usuarios", usuariosRouter);
app.use("/pacientes", pacientesRouter);
app.use("/turnos", turnosRouter);
app.use("/auth", authRouter);

app.listen(port, () => {
  console.log(`La aplicación esta funcionando en el puerto ${port}`);
});
