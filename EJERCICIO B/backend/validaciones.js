import { body, validationResult, param } from 'express-validator';
import { getDb } from './db.js';

const verificarValidaciones = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = new Error('Error de validación de datos');
    err.status = 400;
    err.errors = errors.array();
    return next(err);
  }
  next();
};

const validarUsuario = [
  body('email')
    .isEmail().withMessage('Email inválido')
    .normalizeEmail()
    .trim()
    .custom(async (value, { req }) => {
      const db = getDb();
      const id = req.params.id ? Number(req.params.id) : undefined;
      const [rows] = await db.execute('SELECT id FROM usuarios WHERE email = ?', [value]);
      if (rows.length > 0 && (!id || Number(rows[0].id) !== id)) {
        throw new Error('El email ya está registrado.');
      }
      return true;
    }),
  verificarValidaciones
];

const validarPaciente = [
  body('dni')
    .trim()
    .isLength({ min: 7, max: 10 }).withMessage('DNI inválido')
    .isNumeric().withMessage('DNI debe contener solo números')
    .custom(async (value, { req }) => {
      const db = getDb();
      const id = req.params.id ? Number(req.params.id) : undefined;
      const [rows] = await db.execute('SELECT id FROM pacientes WHERE dni = ?', [value]);
      if (rows.length > 0 && (!id || Number(rows[0].id) !== id)) {
        throw new Error('El DNI ya está registrado para otro paciente.');
      }
      return true;
    }),
  verificarValidaciones
];

const validarMedico = [
  body('matricula_profesional')
    .trim()
    .notEmpty().withMessage('La matrícula profesional es obligatoria')
    .custom(async (value, { req }) => {
      const db = getDb();
      const id = req.params.id ? Number(req.params.id) : undefined;
      const [rows] = await db.execute('SELECT id FROM medicos WHERE matricula_profesional = ?', [value]);
      if (rows.length > 0 && (!id || Number(rows[0].id) !== id)) {
        throw new Error('La matrícula profesional ya está registrada.');
      }
      return true;
    }),
  verificarValidaciones
];

const validarTurno = [
  body('paciente_id')
    .isInt({ gt: 0 }).withMessage('paciente_id debe ser un entero positivo')
    .toInt()
    .custom(async value => {
      const db = getDb();
      const [rows] = await db.execute('SELECT id FROM pacientes WHERE id = ?', [value]);
      if (rows.length === 0) {
        throw new Error('El ID de paciente no existe.');
      }
      return true;
    }),
  body('medico_id')
    .isInt({ gt: 0 }).withMessage('medico_id debe ser un entero positivo')
    .toInt()
    .custom(async value => {
      const db = getDb();
      const [rows] = await db.execute('SELECT id FROM medicos WHERE id = ?', [value]);
      if (rows.length === 0) {
        throw new Error('El ID de médico no existe.');
      }
      return true;
    }),
  verificarValidaciones
];

const validarId = [
  param('id').isInt({ gt: 0 }).toInt().withMessage('El ID debe ser un número entero positivo válido.'),
  verificarValidaciones
];

export {
  validarUsuario,
  validarPaciente,
  validarMedico,
  validarTurno,
  validarId,
  verificarValidaciones
};

