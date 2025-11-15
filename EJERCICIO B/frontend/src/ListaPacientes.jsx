import { useState, useEffect } from 'react';
import { useAuth, AuthPage } from './Auth.jsx'; 
import { User, Plus, Edit, Trash, Loader2, AlertTriangle, UserCog, X } from 'lucide-react';

const BASE_URL = "http://localhost:3000";
const initialFormState = {
    id: null,
    nombre: '',
    apellido: '',
    dni: '',
    fecha_nacimiento: '',
    obra_social: '',    
};

const ListaPacientes = () => {
    const { fetchAuth } = useAuth();
    const [pacientes, setPacientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState(initialFormState);
    const [isEditing, setIsEditing] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [confirmModal, setConfirmModal] = useState({
        visible: false,
        pacienteId: null,
        pacienteNombre: ''
    });

    const fetchPacientes = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetchAuth(`${BASE_URL}/api/pacientes`);
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Error al cargar pacientes: ${response.status}`);
            }

            const result = await response.json();
            setPacientes(result.data || []); 

        } catch (err) {
            console.error("Fetch Pacientes Error:", err);
            setError("No se pudo conectar al servidor o cargar los datos. Asegúrate de que el backend esté corriendo.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (fetchAuth) { 
            fetchPacientes();
        }
    }, [fetchAuth]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleOpenForm = (paciente = initialFormState) => {
        const mappedPaciente = {
            ...initialFormState,
            ...paciente,
        
        };

        setFormData(mappedPaciente);
        setIsEditing(!!paciente.id);
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

        const dataToSend = {
            nombre: formData.nombre,
            apellido: formData.apellido,
            dni: formData.dni,
            fecha_nacimiento: formData.fecha_nacimiento, 
            obra_social: formData.obra_social,           
        };

        const method = isEditing ? 'PUT' : 'POST';
        const url = isEditing ? `${BASE_URL}/api/pacientes/${formData.id}` : `${BASE_URL}/api/pacientes`;

        try {
            const response = await fetchAuth(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSend), 
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Error al ${isEditing ? 'actualizar' : 'crear'} paciente.`);
            }

            await fetchPacientes();
            handleCloseForm();

        } catch (err) {
            console.error("Submit Error:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDeleteConfirm = (paciente) => {
        setConfirmModal({
            visible: true,
            pacienteId: paciente.id,
            pacienteNombre: `${paciente.nombre} ${paciente.apellido}`
        });
    };

    const handleDelete = async () => {
    const id = confirmModal.pacienteId;

        setConfirmModal({ visible: false, pacienteId: null, pacienteNombre: '' });
        setLoading(true);
        setError(null);

    try {
        const turnosRes = await fetchAuth(`${BASE_URL}/api/turnos?paciente_id=${id}`);
        const turnosData = await turnosRes.json();

        if (turnosRes.ok && Array.isArray(turnosData.data) && turnosData.data.length > 0) {
        setError(`No se puede eliminar al paciente porque tiene turno(s) asignado(s).`);
        return;
        }

        const response = await fetchAuth(`${BASE_URL}/api/pacientes/${id}`, {
        method: 'DELETE',
    });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Error al eliminar paciente: ${response.status}`);
    }

        await fetchPacientes();

    } catch (err) {
        console.error("Delete Error:", err);
        setError(err.message);
    } finally {
        setLoading(false);
    }
    };


    const formatLabel = (key) => {
        switch (key) {
            case 'nombre':
                return 'Nombre';
            case 'apellido':
                return 'Apellido';
            case 'dni':
                return 'DNI';
            case 'fecha_nacimiento':
                return 'Fecha de Nacimiento';
            case 'obra_social':
                return 'Obra Social';
            default:
                return key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        }
    };

    const ConfirmationModal = () => (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-3xl w-full max-w-sm p-6 text-center">
                <div className="flex justify-end">
                    <button onClick={() => setConfirmModal({ visible: false, pacienteId: null, pacienteNombre: '' })} className="text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">Confirmar Eliminación</h3>
                <p className="text-gray-600 mb-6">
                    ¿Estás seguro de que deseas eliminar al paciente **{confirmModal.pacienteNombre}**? Esta acción no se puede deshacer.
                </p>
                <div className="flex justify-center space-x-4">
                    <button
                        onClick={() => setConfirmModal({ visible: false, pacienteId: null, pacienteNombre: '' })}
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
                        <UserCog className="w-8 h-8 mr-3 text-teal-600" />
                        Gestión de Pacientes
                    </h1>
                    <button
                        onClick={() => handleOpenForm()}
                        className="flex items-center px-6 py-2 bg-teal-600 text-white font-semibold rounded-lg shadow-lg hover:bg-teal-700 transition duration-150 transform hover:scale-105"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Nuevo Paciente
                    </button>
                </div>

                {showForm && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 z-50 flex justify-center items-center p-4">
                        <div className="bg-white rounded-xl shadow-3xl w-full max-w-lg p-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">
                                {isEditing ? 'Editar Paciente' : 'Crear Paciente'}
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {Object.keys(initialFormState).filter(key => key !== 'id').map((key) => {
                                    let inputType = 'text';
                                    if (key.includes('fecha')) {
                                        inputType = 'date';
                                    }
                                    
                                    return (
                                        <div key={key}>
                                            <label className="block text-gray-700 text-sm font-medium mb-1">
                                                {formatLabel(key)}
                                            </label>
                                            <input
                                                type={inputType}
                                                name={key}
                                                value={formData[key]}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                                            />
                                        </div>
                                    );
                                })}

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
                                                ? 'bg-teal-400 cursor-not-allowed' 
                                                : 'bg-teal-600 hover:bg-teal-700'}`}
                                    >
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (isEditing ? 'Guardar Cambios' : 'Crear Paciente')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {loading && !showForm && (
                    <div className="flex justify-center items-center p-6 bg-teal-50 rounded-lg shadow-inner">
                        <Loader2 className="w-6 h-6 mr-3 text-teal-500 animate-spin" />
                        <p className="text-teal-700 font-medium">Conectando con el backend y cargando pacientes...</p>
                    </div>
                )}

                {error && !loading && (
                    <div className="flex items-center p-4 mb-4 bg-red-100 border border-red-400 text-red-700 rounded-lg shadow-md">
                        <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0" />
                        <span className="font-bold">Error de API:</span> {error}
                    </div>
                )}

                {!loading && !error && pacientes.length > 0 && (
                    <div className="bg-white rounded-xl shadow-2xl overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre Completo</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DNI</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Nacimiento</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Obra Social</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {pacientes.map((paciente) => (
                                    <tr key={paciente.id} className="hover:bg-gray-50 transition duration-150">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            <User className="w-4 h-4 mr-2 inline text-teal-500" />
                                            {`${paciente.nombre} ${paciente.apellido}`}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{paciente.dni}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{paciente.fecha_nacimiento}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{paciente.obra_social}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button 
                                                onClick={() => handleOpenForm(paciente)}
                                                className="text-indigo-600 hover:text-indigo-900 mr-4 transition duration-150 p-2 rounded-full hover:bg-indigo-50"
                                                title="Editar"
                                            >
                                                <Edit className="w-5 h-5" />
                                            </button>
                                            <button 
                                                onClick={() => handleOpenDeleteConfirm(paciente)}
                                                className="text-red-600 hover:text-red-900 transition duration-150 p-2 rounded-full hover:bg-red-50"
                                                title="Eliminar"
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
                {!loading && !error && pacientes.length === 0 && (
                    <div className="text-center p-10 bg-white rounded-xl shadow-lg">
                        <p className="text-xl text-gray-500">No hay pacientes registrados en el sistema.</p>
                        <p className="text-gray-400 mt-2">Haz clic en "Nuevo Paciente" para comenzar o revisa si tu BD está funcionando correctamente.</p>
                    </div>
                )}
            </div>
        </AuthPage>
    );
};

export default ListaPacientes;