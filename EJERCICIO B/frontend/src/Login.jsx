import { useState } from 'react';
import { useAuth } from './Auth.jsx';
import { LogIn } from 'lucide-react';

const Login = ({ setCurrentPage }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);

  const { login, error: authError, isAuthenticated, setError } = useAuth();

  if (isAuthenticated) {
    return (
      <div className="flex justify-center items-center h-screen bg-green-50 p-4">
        <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-sm text-center">
          <h2 className="text-2xl font-bold text-green-600 mb-4">¡Sesión Iniciada!</h2>
          <p className="text-gray-700">Ya estás conectado. Navega a otras secciones.</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    setLoginSuccess(false);
    if (setError) setError(null);

    const userData = {
      email,
      contrasena: password
    };

    const result = await login(userData);
    setIsSubmitting(false);

    if (result?.success) {
      setLoginSuccess(true);
      setMessage('Inicio de sesión exitoso. Redirigiendo...');
      setTimeout(() => {
        setCurrentPage('home'); 
      }, 1500);
    } else {
      setMessage(result?.error || 'Error desconocido. Revisa los datos ingresados.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <LogIn className="w-8 h-8 text-indigo-600" />
        </div>
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Iniciar Sesión</h2>

        {(authError || (!loginSuccess && message)) && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {authError || message}
          </div>
        )}

        {loginSuccess && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-1">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (setError) setError(null); 
                setMessage('');
              }}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
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
              }}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-2 px-4 rounded-lg text-white font-semibold transition duration-200 
              ${isSubmitting
                ? 'bg-indigo-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg'}`}
          >
            {isSubmitting ? 'Iniciando...' : 'Entrar'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          ¿No tienes cuenta?{' '}
          <a
            href="#"
            onClick={() => setCurrentPage('register')}
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Regístrate
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;

