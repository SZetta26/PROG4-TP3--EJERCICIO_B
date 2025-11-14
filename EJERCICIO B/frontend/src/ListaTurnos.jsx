import { useState, useEffect, useMemo } from 'react';
import { useAuth, AuthPage } from './Auth.jsx';
import { CalendarCheck, Plus, Edit, Trash, Loader2, AlertTriangle, Clock, Calendar, MessageSquare, X } from 'lucide-react';

const BASE_URL = "http://localhost:3000";

const initialFormState = {
    id: null,
    fecha: '',
    hora: '', 
    pacienteId: '',
    medicoId: '',
    estado: 'pendiente', 
    observaciones: '',
};

const ListaTurnos = () => { 
    const { fetchAuth } = useAuth();
    const [turnos, setTurnos] = useState([]);
    const [medicos, setMedicos] = useState([]);
    const [pacientes, setPacientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState(initialFormState);
    const [isEditing, setIsEditing] = useState(false);
    const [showForm, setShowForm] = useState(false);

    const [showEditModal, setShowEditModal] = useState(false);
    const [currentTurno, setCurrentTurno] = useState(null);
    const [editNotes, setEditNotes] = useState('');
    const [editStatus, setEditStatus] = useState('');

    const [confirmModal, setConfirmModal] = useState({
        visible: false,
        turnoId: null,
        turnoInfo: ''
    });

    const getEntityName = (id, list) => {
        const entity = list.find(e => e.id == id); 
        return entity ? `${entity.nombre} ${entity.apellido}` : 'Desconocido';
    };

    const map = useMemo(() => ({
        'pendiente': 'Pendiente',
        'confirmado': 'Confirmado',
        'cancelado': 'Cancelado',
        'finalizado': 'Finalizado',
    }), []);
    
    const statusColor = (estado) => {
        switch (estado) {
            case 'confirmado': return 'bg-green-100 text-green-800';
            case 'cancelado': return 'bg-red-100 text-red-800';
            case 'finalizado': return 'bg-blue-100 text-blue-800';
            default: return 'bg-yellow-100 text-yellow-800';
        }
    };

    const fetchAllData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [turnosRes, medicosRes, pacientesRes] = await Promise.all([
                fetchAuth(`${BASE_URL}/api/turnos`),
                fetchAuth(`${BASE_URL}/api/medicos`),
                fetchAuth(`${BASE_URL}/api/pacientes`),
            ]);

            if (!turnosRes.ok || !medicosRes.ok || !pacientesRes.ok) {
                throw new Error("Una o más listas no pudieron cargarse. Revise las rutas del backend.");
            }

            const turnosResult = await turnosRes.json();
            const medicosResult = await medicosRes.json();
            const pacientesResult = await pacientesRes.json();
            const mappedTurnos = (turnosResult.data || []).map(turno => {
            let rawDate = turno.fecha;
            let formattedDate = rawDate && typeof rawDate === 'string'
                ? rawDate.substring(0, 10)
                : rawDate; 

                return {
                    ...turno,
                    fecha: formattedDate,
                    pacienteId: turno.pacienteId || turno.paciente_id,
                    medicoId: turno.medicoId || turno.medico_id,
                };
            });

            setTurnos(mappedTurnos);
            setMedicos(medicosResult.data || []);
            setPacientes(pacientesResult.data || []); 

        } catch (err) {
            console.error("Fetch All Data Error:", err);
            setError(err.message);
        } finally {
            setLoading(false); 
        }
    };

    useEffect(() => {
        if (fetchAuth) {
            fetchAllData();
        }
    }, [fetchAuth]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        const isIdField = ['pacienteId', 'medicoId'].includes(name);
        const newValue = isIdField && value ? parseInt(value, 10) : value;

        setFormData({ ...formData, [name]: newValue });
    };

    const handleOpenForm = (turno = initialFormState) => {
        const baseTurno = {
            ...initialFormState, 
            ...turno,
            id: turno.id || null, 
        };
        setFormData(baseTurno);
        setIsEditing(!!turno.id);
        setShowForm(true);
        setError(null);
    };

    const handleCloseForm = () => {
        setFormData(initialFormState);
        setIsEditing(false);
        setShowForm(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const basePayload = {
            fecha: formData.fecha,
            hora: formData.hora,
            paciente_id: formData.pacienteId, 
            medico_id: formData.medicoId,
            estado: formData.estado,
            observaciones: formData.observaciones,
        };
        
        const payload = isEditing ? basePayload : { ...basePayload, estado: 'pendiente', observaciones: '' };

        const method = isEditing ? 'PUT' : 'POST';
        const url = isEditing ? `${BASE_URL}/api/turnos/${formData.id}` : `${BASE_URL}/api/turnos`;

        try {
            const response = await fetchAuth(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Error al ${isEditing ? 'actualizar' : 'crear'} turno.`);
            }

            await fetchAllData(); 
            handleCloseForm();

        } catch (err) {
            console.error("Submit Error:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    
    const handleOpenEditModal = (turno) => {
        setCurrentTurno(turno);
        setEditNotes(turno.observaciones || '');
        setEditStatus(turno.estado);
        setShowEditModal(true);
        setError(null);
    };

    const handleCloseEditModal = () => {
        setCurrentTurno(null);
        setEditNotes('');
        setEditStatus('');
        setShowEditModal(false);
    };

    const handleUpdateStatusAndNotes = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const updatePayload = {
            observaciones: editNotes,
            estado: editStatus,
        };
        
        //console.log("Payload Final Enviado:", updatePayload); 

        try {
            const response = await fetchAuth(`${BASE_URL}/api/turnos/${currentTurno.id}`, {
                method: 'PATCH', 
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatePayload), 
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Error al actualizar el estado/notas del turno. Código: ${response.status}`);
            }

            await fetchAllData(); 
            handleCloseEditModal(); 

        } catch (err) {
            console.error("Update Status Error:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDeleteConfirm = (turno) => {
        setConfirmModal({
            visible: true,
            turnoId: turno.id,
            turnoInfo: `Turno del ${turno.fecha} a las ${turno.hora} con ${getEntityName(turno.medicoId, medicos)}`
        });
    };

    const handleDelete = async () => {
        const id = confirmModal.turnoId;
        
        setConfirmModal({ visible: false, turnoId: null, turnoInfo: '' });
        setLoading(true);
        setError(null);

        try {
            const response = await fetchAuth(`${BASE_URL}/api/turnos/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Error al eliminar turno: ${response.status}`);
            }

            await fetchAllData();

        } catch (err) {
            console.error("Delete Error:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const ConfirmationModal = () => (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-3xl w-full max-w-sm p-6 text-center">
                <div className="flex justify-end">
                    <button onClick={() => setConfirmModal({ visible: false, turnoId: null, turnoInfo: '' })} className="text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">Confirmar Eliminación</h3>
                <p className="text-gray-600 mb-6 text-sm">
                    ¿Estás seguro de que deseas eliminar este turno?
                    <br />
                    **{confirmModal.turnoInfo}**
                </p>
                <div className="flex justify-center space-x-4">
                    <button
                        onClick={() => setConfirmModal({ visible: false, turnoId: null, turnoInfo: '' })}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition duration-150"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={loading}
                        className={`px-4 py-2 text-white font-semibold rounded-lg shadow-md transition duration-150 ${loading ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Eliminar'}
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <AuthPage>
            {confirmModal.visible && <ConfirmationModal />}
            
            <div className="container mx-auto p-4 sm:p-6 lg:p-8">
                <div className="flex items-center justify-between mb-8 border-b pb-4">
                    <h1 className="text-3xl font-extrabold text-gray-800 flex items-center">
                        <CalendarCheck className="w-8 h-8 mr-3 text-indigo-600" />
                        Gestión de Turnos
                    </h1>
                    <button
                        onClick={() => handleOpenForm()}
                        className="flex items-center px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:bg-indigo-700 transition duration-150 transform hover:scale-105"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Nuevo Turno
                    </button>
                </div>

                {showForm && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 z-50 flex justify-center items-center p-4">
                        <div className="bg-white rounded-xl shadow-3xl w-full max-w-lg p-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">
                                {isEditing ? 'Editar Turno' : 'Crear Turno'}
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-gray-700 text-sm font-medium mb-1">Fecha</label>
                                        <input
                                            type="date"
                                            name="fecha"
                                            value={formData.fecha}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-700 text-sm font-medium mb-1">Hora</label>
                                        <input
                                            type="time"
                                            name="hora"
                                            value={formData.hora}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-1">Paciente</label>
                                    <select
                                        name="pacienteId"
                                        value={formData.pacienteId}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        <option value="">Seleccione un Paciente</option>
                                        {pacientes.map(p => (
                                            <option key={p.id} value={p.id}>{`${p.nombre} ${p.apellido} (DNI: ${p.dni})`}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-1">Médico</label>
                                    <select
                                        name="medicoId"
                                        value={formData.medicoId}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        <option value="">Seleccione un Médico</option>
                                        {medicos.map(m => (
                                            <option key={m.id} value={m.id}>{`${m.nombre} ${m.apellido} (${m.especialidad})`}</option>
                                        ))}
                                    </select>
                                </div>
                                
                                {isEditing && (
                                    <>
                                        <div>
                                            <label className="block text-gray-700 text-sm font-medium mb-1">Estado (Sólo edición inicial)</label>
                                            <select
                                                name="estado"
                                                value={formData.estado}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                            >
                                                {Object.keys(map).map(key => (
                                                    <option key={key} value={key}>{map[key]}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-gray-700 text-sm font-medium mb-1">Observaciones</label>
                                            <textarea
                                                name="observaciones"
                                                value={formData.observaciones}
                                                onChange={handleChange}
                                                rows="2"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                                placeholder="Notas de la consulta, motivo de cancelación, etc."
                                            />
                                        </div>
                                    </>
                                )}

                                <div className="flex justify-end space-x-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={handleCloseForm}
                                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition duration-150"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className={`px-4 py-2 text-white font-semibold rounded-lg shadow-md transition duration-150 
                                            ${loading 
                                                ? 'bg-indigo-400 cursor-not-allowed' 
                                                : 'bg-indigo-600 hover:bg-indigo-700'}`}
                                    >
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (isEditing ? 'Guardar Cambios' : 'Agendar Turno')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {showEditModal && currentTurno && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 z-50 flex justify-center items-center p-4">
                        <div className="bg-white rounded-xl shadow-3xl w-full max-w-md p-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2 flex items-center">
                                <MessageSquare className="w-6 h-6 mr-2 text-indigo-600" />
                                Actualizar Turno
                            </h2>
                            <form onSubmit={handleUpdateStatusAndNotes} className="space-y-4">
                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-1">Estado del Turno</label>
                                    <select
                                        name="estado"
                                        value={editStatus}
                                        onChange={(e) => setEditStatus(e.target.value)}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        {Object.keys(map).map(key => (
                                            <option key={key} value={key}>{map[key]}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-1">Observaciones (Notas)</label>
                                    <textarea
                                        name="observaciones"
                                        value={editNotes}
                                        onChange={(e) => setEditNotes(e.target.value)}
                                        rows="4"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="Notas de la consulta, motivo de cancelación, etc."
                                    />
                                </div>

                                <div className="flex justify-end space-x-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={handleCloseEditModal}
                                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition duration-150"
                                    >
                                        Cerrar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className={`px-4 py-2 text-white font-semibold rounded-lg shadow-md transition duration-150 
                                            ${loading 
                                                ? 'bg-indigo-400 cursor-not-allowed' 
                                                : 'bg-indigo-600 hover:bg-indigo-700'}`}
                                    >
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Guardar Actualización'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {(loading && !showForm && !showEditModal && !confirmModal.visible) && (
                    <div className="flex justify-center items-center p-6 bg-indigo-50 rounded-lg shadow-inner">
                        <Loader2 className="w-6 h-6 mr-3 text-indigo-500 animate-spin" />
                        <p className="text-indigo-700 font-medium">Cargando datos de turnos...</p>
                    </div>
                )}

                {error && !loading && (
                    <div className="flex items-center p-4 mb-4 bg-red-100 border border-red-400 text-red-700 rounded-lg shadow-md">
                        <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0" />
                        <span className="font-medium">Error:</span> {error}
                    </div>
                )}

                {!loading && !error && turnos.length > 0 && (
                    <div className="bg-white rounded-xl shadow-2xl overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha / Hora</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paciente</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Médico</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Observaciones</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {turnos.map((turno) => (
                                    <tr key={turno.id} className="hover:bg-gray-50 transition duration-150">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            <div className="flex items-center text-xs text-gray-500"><Calendar className="w-3 h-3 mr-1" />{turno.fecha}</div>
                                            <div className="flex items-center text-sm text-indigo-600 font-bold"><Clock className="w-3 h-3 mr-1" />{turno.hora}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {turno.paciente_nombre && turno.paciente_apellido 
                                                ? `${turno.paciente_nombre} ${turno.paciente_apellido}` 
                                                : getEntityName(turno.pacienteId, pacientes)
                                            }
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {turno.medico_nombre && turno.medico_apellido
                                                ? `${turno.medico_nombre} ${turno.medico_apellido} (${turno.medico_especialidad})`
                                                : getEntityName(turno.medicoId, medicos)
                                            }
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor(turno.estado)}`}>
                                                {map[turno.estado] || turno.estado}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={turno.observaciones}>
                                            {turno.observaciones || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button 
                                                onClick={() => handleOpenEditModal(turno)}
                                                className="text-teal-600 hover:text-teal-900 mr-4 transition duration-150 p-2 rounded-full hover:bg-teal-50"
                                                title="Editar Estado/Notas"
                                            >
                                                <MessageSquare className="w-5 h-5" />
                                            </button>
                                            <button 
                                                onClick={() => handleOpenForm(turno)}
                                                className="text-indigo-600 hover:text-indigo-900 mr-4 transition duration-150 p-2 rounded-full hover:bg-indigo-50"
                                                title="Editar Turno"
                                            >
                                                <Edit className="w-5 h-5" />
                                            </button>
                                            <button 
                                                onClick={() => handleOpenDeleteConfirm(turno)}
                                                className="text-red-600 hover:text-red-900 transition duration-150 p-2 rounded-full hover:bg-red-50"
                                                title="Eliminar Turno"
                                            >
                                                <Trash className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {!loading && !error && turnos.length === 0 && (
                    <div className="p-6 text-center bg-gray-50 rounded-xl shadow-inner">
                        <CalendarCheck className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600">No hay turnos registrados en el sistema.</p>
                    </div>
                )}
            </div>
        </AuthPage>
    );
};

export default ListaTurnos;