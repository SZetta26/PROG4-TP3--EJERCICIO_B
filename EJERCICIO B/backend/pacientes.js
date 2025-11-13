import express from 'express';
import { getDb } from './db.js';
import { validarPaciente, validarId } from './validaciones.js';
import { protegerRuta } from './auth.js';

const router = express.Router();

router.post('/', protegerRuta, validarPaciente, async (req, res, next) => {
    const { nombre, apellido, dni, fecha_nacimiento, obra_social } = req.body;
    try {
        const db = getDb();
        const [result] = await db.execute(
            'INSERT INTO pacientes (nombre, apellido, dni, fecha_nacimiento, obra_social) VALUES (?, ?, ?, ?, ?)',
            [nombre, apellido, dni, fecha_nacimiento, obra_social]
        );
        res.status(201).json({ 
            success: true, 
            message: 'Paciente creado exitosamente', 
            id: result.insertId 
        });
    } catch (error) {
        next(error);
    }
});

router.get('/', async (req, res, next) => {
    try {
        const db = getDb();
        const [rows] = await db.execute('SELECT * FROM pacientes');
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        next(error);
    }
});

router.get('/:id', validarId, async (req, res, next) => {
    const { id } = req.params;
    try {
        const db = getDb();
        const [rows] = await db.execute('SELECT * FROM pacientes WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Paciente no encontrado' });
        }
        res.status(200).json({ success: true, data: rows[0] });
    } catch (error) {
        next(error);
    }
});

router.put('/:id', protegerRuta, validarId, validarPaciente, async (req, res, next) => {
    const { id } = req.params;
    const { nombre, apellido, dni, fecha_nacimiento, obra_social } = req.body;
    try {
        const db = getDb();
        const [result] = await db.execute(
            'UPDATE pacientes SET nombre = ?, apellido = ?, dni = ?, fecha_nacimiento = ?, obra_social = ? WHERE id = ?',
            [nombre, apellido, dni, fecha_nacimiento, obra_social, id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Paciente no encontrado para actualizar' });
        }
        res.status(200).json({ success: true, message: 'Paciente actualizado exitosamente' });
    } catch (error) {
        next(error);
    }
});

router.delete('/:id', protegerRuta, validarId, async (req, res, next) => {
    const { id } = req.params;
    try {
        const db = getDb();
        const [result] = await db.execute('DELETE FROM pacientes WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Paciente no encontrado para eliminar' });
        }
        res.status(204).send(); 
    } catch (error) {
        next(error);
    }
});

export default router;