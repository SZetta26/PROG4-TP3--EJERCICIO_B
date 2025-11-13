import express from 'express';
import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { getDb } from './db.js';
import { validarUsuario } from './validaciones.js'; 
export const SALTROUNDS = 12; 

const JWT_SECRET = process.env.JWT_SECRET; 
const router = express.Router();

export const authConfig = () => {
    if (!JWT_SECRET) {
        console.error("ERROR: JWT_SECRET no está definido. Revisa tu archivo .env.");
    }

    const opts = {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: JWT_SECRET
    };

    passport.use(new JwtStrategy(opts, async (jwt_payload, done) => {
        try {
            const db = getDb();
            const [rows] = await db.execute('SELECT id, nombre, email FROM usuarios WHERE id = ?', [jwt_payload.sub]);
            const user = rows[0];

            if (user) {
                return done(null, user);
            } else {
                return done(null, false);
            }
        } catch (error) {
            return done(error, false);
        }
    }));
};

export const protegerRuta = passport.authenticate('jwt', { session: false });

router.post('/register', validarUsuario, async (req, res, next) => {
    const { nombre, email, contrasena } = req.body;
    try {
        const contrasenaHash = await bcrypt.hash(contrasena, SALTROUNDS);

        const db = getDb(); 
        const [result] = await db.execute(
            'INSERT INTO usuarios (nombre, email, contrasena) VALUES (?, ?, ?)',
            [nombre, email, contrasenaHash]
        );
        
        const token = jwt.sign(
            { sub: result.insertId, email: email },
            JWT_SECRET,
            { expiresIn: '4h' } 
        );

        res.status(201).json({
            success: true,
            message: 'Usuario registrado exitosamente. Token generado.',
            user: { id: result.insertId, nombre, email },
            token: token
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ success: false, message: 'El email ya se encuentra registrado.' });
        }
        next(error);
    }
});

router.post('/login', async (req, res, next) => {
    const { email, contrasena } = req.body;

    if (!email || !contrasena) {
        return res.status(400).json({ success: false, message: 'Faltan credenciales de inicio de sesión' });
    }

    try {
        const db = getDb();
        const [rows] = await db.execute('SELECT id, nombre, email, contrasena FROM usuarios WHERE email = ?', [email]);
        const user = rows[0];

        if (!user) {
            return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
        }

        const isMatch = await bcrypt.compare(contrasena, user.contrasena);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
        }

        const token = jwt.sign(
            { sub: user.id, email: user.email }, 
            JWT_SECRET,
            { expiresIn: '4h' } 
        );

        res.status(200).json({
            success: true,
            message: 'Inicio de sesión exitoso',
            user: { id: user.id, nombre: user.nombre, email: user.email },
            token: token
        });

    } catch (error) {
        next(error);
    }
});

export default router;