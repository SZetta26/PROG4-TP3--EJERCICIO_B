import express from "express";
import cors from "cors";
import passport from "passport"; 
import { conectarDB } from "./db.js";
import usuariosRouter from "./usuarios.js";
import pacientesRouter from "./pacientes.js";
import medicosRouter from "./medicos.js";
import turnosRouter from "./turnos.js";
import authRouter, { authConfig, protegerRuta } from "./auth.js"; 

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(passport.initialize());
authConfig();  

app.use('/api/auth', authRouter); 
app.use('/api/usuarios', usuariosRouter);
app.use('/api/pacientes', pacientesRouter);
app.use('/api/medicos', medicosRouter);
app.use('/api/turnos', turnosRouter);

app.get('/', (req, res) => {
    res.status(200).json({ message: 'Corriendo sistema de gestion de clinicas.' });
});

app.get('/api/protegida', protegerRuta, (req, res) => {
    res.status(200).json({ 
        success: true, 
        message: 'Acceso a ruta protegida exitoso.',
        usuario: req.user
    });
});

app.use((req, res, next) => {
    const error = new Error(`Ruta no encontrada: ${req.originalUrl}`);
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    const status = error.status || 500;
    
    if (status === 400 && error.errors) {
        return res.status(400).json({
            success: false,
            message: error.message || 'Error de validación de datos',
            errors: error.errors
        });
    }

    res.status(status).json({
        success: false,
        message: error.message || 'Error interno del servidor',
    });
});

conectarDB() 
    .then(() => {
        app.listen(port, () => {
            console.log(`Aplicacion funcionando en puerto:${port}`);
        });
    })
    .catch((error) => {
        console.error("Fallo al iniciar el servidor. Error de DB:", error.message);
        process.exit(1);
    });