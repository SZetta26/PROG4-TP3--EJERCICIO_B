import express from 'express';
import { getDb } from './db.js';
import { validarTurno, validarId } from './validaciones.js';
import { protegerRuta } from './auth.js';

const router = express.Router();

router.post('/', protegerRuta, validarTurno, async (req, res, next) => {
    const { paciente_id, medico_id, fecha, hora, estado, observaciones } = req.body;
    try {
        const db = getDb();
        const [result] = await db.execute(
            'INSERT INTO turnos (paciente_id, medico_id, fecha, hora, estado, observaciones) VALUES (?, ?, ?, ?, ?, ?)',
            [paciente_id, medico_id, fecha, hora, estado || 'pendiente', observaciones]
        );
        res.status(201).json({ 
            success: true, 
            message: 'Turno creado exitosamente', 
            id: result.insertId 
        });
    } catch (error) {
        next(error);
    }
});

router.get('/', async (req, res, next) => {
    try {
        const db = getDb();
        const query = `
            SELECT 
                t.id, 
                t.fecha, 
                t.hora, 
                t.estado, 
                t.observaciones,
                t.paciente_id,
                t.medico_id,
                p.nombre AS paciente_nombre,
                p.apellido AS paciente_apellido,
                m.nombre AS medico_nombre,
                m.apellido AS medico_apellido,
                m.especialidad AS medico_especialidad
            FROM turnos t
            JOIN pacientes p ON t.paciente_id = p.id
            JOIN medicos m ON t.medico_id = m.id
            ORDER BY t.fecha DESC, t.hora ASC
        `;
        const [rows] = await db.execute(query);
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        next(error);
    }
});

router.get('/:id', validarId, async (req, res, next) => {
    const { id } = req.params;
    try {
        const db = getDb();
        const query = `
            SELECT 
                t.id, 
                t.fecha, 
                t.hora, 
                t.estado, 
                t.observaciones,
                t.paciente_id,
                t.medico_id,
                p.nombre AS paciente_nombre,
                p.apellido AS paciente_apellido,
                m.nombre AS medico_nombre,
                m.apellido AS medico_apellido,
                m.especialidad AS medico_especialidad
            FROM turnos t
            JOIN pacientes p ON t.paciente_id = p.id
            JOIN medicos m ON t.medico_id = m.id
            WHERE t.id = ?
        `;
        const [rows] = await db.execute(query, [id]);
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Turno no encontrado' });
        }
        res.status(200).json({ success: true, data: rows[0] });
    } catch (error) {
        next(error);
    }
});

router.put('/:id', protegerRuta, validarId, validarTurno, async (req, res, next) => {
    const { id } = req.params;
    let { paciente_id, medico_id, fecha, hora, estado, observaciones } = req.body; 
        paciente_id = parseInt(paciente_id, 10);
        medico_id = parseInt(medico_id, 10);

    try {
        const db = getDb();
        const [result] = await db.execute(
            'UPDATE turnos SET paciente_id = ?, medico_id = ?, fecha = ?, hora = ?, estado = ?, observaciones = ? WHERE id = ?',
            [paciente_id, medico_id, fecha, hora, estado || 'pendiente', observaciones, id]
        );
            if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Turno no encontrado para actualizar' });
        }
            res.status(200).json({ success: true, message: 'Turno actualizado exitosamente' });
            } catch (error) {
            console.error("Error al actualizar turno:", error);
            next(error);
        }
    });

router.patch('/:id', protegerRuta, validarId, async (req, res, next) => {
    const { id } = req.params;
    const { observaciones, estado } = req.body;

    const fields = [];
    const values = [];

    if (observaciones === undefined && estado === undefined) {
        return res.status(400).json({ success: false, message: 'Se requiere al menos el campo "observaciones" o "estado" para la actualización parcial.' });
    }
    
    if (observaciones !== undefined) {
        fields.push("observaciones = ?");
        values.push(observaciones);
    }
    if (estado !== undefined) {
        fields.push("estado = ?");
        values.push(estado);
    }
    
    const sql = `UPDATE turnos SET ${fields.join(', ')} WHERE id = ?`;
    values.push(id);

    try {
        const db = getDb();
        const [result] = await db.execute(sql, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Turno no encontrado para actualizar parcialmente' });
        }
        res.status(200).json({ success: true, message: 'Turno actualizado parcialmente exitosamente' });

    } catch (error) {
        console.error("Error al actualizar turno con PATCH:", error);
        next(error);
    }
});

router.delete('/:id', protegerRuta, validarId, async (req, res, next) => {
    const { id } = req.params;
    try {
        const db = getDb();
        const [result] = await db.execute('DELETE FROM turnos WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Turno no encontrado para eliminar' });
        }
        res.status(204).send(); 
    } catch (error) {
        next(error);
    }
});

export default router;