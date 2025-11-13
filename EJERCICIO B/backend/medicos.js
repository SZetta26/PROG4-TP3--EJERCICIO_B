import express from 'express';
import { getDb } from './db.js';
import { validarMedico, validarId } from './validaciones.js';
import { protegerRuta } from './auth.js';

const router = express.Router();

router.post('/', protegerRuta, validarMedico, async (req, res, next) => {
    const { nombre, apellido, especialidad, matricula_profesional } = req.body;
    try {
        const db = getDb();
        const [result] = await db.execute(
            'INSERT INTO medicos (nombre, apellido, especialidad, matricula_profesional) VALUES (?, ?, ?, ?)',
            [nombre, apellido, especialidad, matricula_profesional]
        );
        res.status(201).json({ 
            success: true, 
            message: 'Médico creado exitosamente', 
            id: result.insertId 
        });
    } catch (error) {
        next(error);
    }
});

router.get('/', async (req, res, next) => {
    try {
        const db = getDb();
        const [rows] = await db.execute('SELECT * FROM medicos');
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        next(error);
    }
});

router.get('/:id', validarId, async (req, res, next) => {
    const { id } = req.params;
    try {
        const db = getDb();
        const [rows] = await db.execute('SELECT * FROM medicos WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Médico no encontrado' });
        }
        res.status(200).json({ success: true, data: rows[0] });
    } catch (error) {
        next(error);
    }
});

router.put('/:id', protegerRuta, validarId, validarMedico, async (req, res, next) => {
    const { id } = req.params;
    const { nombre, apellido, especialidad, matricula_profesional } = req.body;
    try {
        const db = getDb();
        const [result] = await db.execute(
            'UPDATE medicos SET nombre = ?, apellido = ?, especialidad = ?, matricula_profesional = ? WHERE id = ?',
            [nombre, apellido, especialidad, matricula_profesional, id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Médico no encontrado para actualizar' });
        }
        res.status(200).json({ success: true, message: 'Médico actualizado exitosamente' });
    } catch (error) {
        next(error);
    }
});

router.delete('/:id', protegerRuta, validarId, async (req, res, next) => {
    const { id } = req.params;
    try {
        const db = getDb();
        const [result] = await db.execute('DELETE FROM medicos WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Médico no encontrado para eliminar' });
        }
        res.status(204).send(); 
    } catch (error) {
        next(error);
    }
});

export default router;