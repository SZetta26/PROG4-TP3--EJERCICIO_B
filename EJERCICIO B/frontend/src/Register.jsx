import { useState } from 'react';
import { useAuth } from './Auth.jsx';
import { UserPlus } from 'lucide-react';

const Register = ({ setCurrentPage }) => {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const [generalError, setGeneralError] = useState('');

  const { register, error: authError, setError } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    setRegisterSuccess(false);
    setValidationErrors([]);
    setGeneralError('');
    if (setError) setError(null);

    const userData = {
      nombre,
      email,
      contrasena: password
    };

    const result = await register(userData);
    setIsSubmitting(false);

    if (result.success) {
      setRegisterSuccess(true);
      setMessage('¡Registro exitoso! Redirigiendo al login...');
      setTimeout(() => {
        setCurrentPage('login');
      }, 1500);
    } else {
      if (Array.isArray(result.errors)) {
        setValidationErrors(result.errors);
      } else {
        setGeneralError(result.error || 'Error en el registro. Inténtalo de nuevo.');
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <UserPlus className="w-8 h-8 text-teal-600" />
        </div>
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Registro de Usuario</h2>

        {generalError && (
          <div className="mb-4 p-3 rounded-lg text-sm bg-red-100 border-red-400 text-red-700">
            {generalError}
          </div>
        )}

        {validationErrors.length > 0 && (
          <ul className="mb-4 p-3 rounded-lg text-sm bg-red-100 border-red-400 text-red-700 list-disc list-inside">
            {validationErrors.map((err, index) => (
              <li key={index}>{err.msg}</li>
            ))}
          </ul>
        )}

        {registerSuccess && (
          <div className="mb-4 p-3 rounded-lg text-sm bg-green-100 border-green-400 text-green-700">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="nombre" className="block text-gray-700 text-sm font-medium mb-1">
              Nombre
            </label>
            <input
              id="nombre"
              type="text"
              value={nombre}
              onChange={(e) => {
                setNombre(e.target.value);
                if (setError) setError(null);
                setMessage('');
                setValidationErrors([]);
                setGeneralError('');
              }}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (setError) setError(null);
                setMessage('');
                setValidationErrors([]);
                setGeneralError('');
              }}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-gray-700 text-sm font-medium mb-1">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (setError) setError(null);
                setMessage('');
                setValidationErrors([]);
                setGeneralError('');
              }}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-2 px-4 rounded-lg text-white font-semibold transition duration-200 ${
              isSubmitting
                ? 'bg-teal-400 cursor-not-allowed'
                : 'bg-teal-600 hover:bg-teal-700 shadow-md hover:shadow-lg'
            }`}
          >
            {isSubmitting ? 'Registrando...' : 'Crear Cuenta'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          ¿Ya tienes cuenta?{' '}
          <a
            href="#"
            onClick={() => setCurrentPage('login')}
            className="text-indigo-600 hover:text-indigo-800 font-medium ml-1"
          >
            Inicia Sesión
          </a>
        </p>
      </div>
    </div>
  );
};

export default Register;

