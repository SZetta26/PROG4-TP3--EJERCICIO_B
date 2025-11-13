import express from 'express';
import bcrypt from 'bcrypt';
import { getDb } from './db.js';
import { validarUsuario, validarId } from './validaciones.js'; 
import { protegerRuta, SALTROUNDS } from './auth.js'; 

const router = express.Router();

router.get('/', protegerRuta, async (req, res, next) => {
    try {
        const db = getDb();
        const [rows] = await db.execute('SELECT id, nombre, email FROM usuarios');
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        next(error);
    }
});

router.get('/:id', protegerRuta, validarId, async (req, res, next) => {
    const { id } = req.params;
    try {
        const db = getDb();
        const [rows] = await db.execute('SELECT id, nombre, email FROM usuarios WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }
        res.status(200).json({ success: true, data: rows[0] });
    } catch (error) {
        next(error);
    }
});

router.put('/:id', protegerRuta, validarId, validarUsuario, async (req, res, next) => {
    const { id } = req.params;
    let { nombre, email, contrasena } = req.body;
    
    try {
        const contrasenaHash = await bcrypt.hash(contrasena, SALTROUNDS);
        contrasena = contrasenaHash;

        const db = getDb();
        const [result] = await db.execute(
            'UPDATE usuarios SET nombre = ?, email = ?, contrasena = ? WHERE id = ?',
            [nombre, email, contrasena, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado para actualizar' });
        }
        res.status(200).json({ success: true, message: 'Usuario actualizado exitosamente' });
    } catch (error) {
        next(error);
    }
});

router.delete('/:id', protegerRuta, validarId, async (req, res, next) => {
    const { id } = req.params;
    try {
        const db = getDb();
        const [result] = await db.execute('DELETE FROM usuarios WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado para eliminar' });
        }
        res.status(204).send();
    } catch (error) {
        next(error);
    }
});

export default router;