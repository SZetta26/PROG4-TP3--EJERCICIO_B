import { createContext, useContext, useState, useMemo } from 'react';
import { LogIn } from 'lucide-react';

export const AuthContext = createContext(null); 

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('authToken'));
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('authUser');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (userData) => {
    setError(null);
    setIsLoading(true);
    const LOGIN_URL = 'http://localhost:3000/api/auth/login';

    try {
      const response = await fetch(LOGIN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      const responseData = await response.json();

      if (!response.ok) {
        const errorMessage = responseData.message || `Error de inicio de sesión (${response.status}).`;
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }

      const { token, user: userDataFromBackend } = responseData;
      localStorage.setItem('authToken', token);
      localStorage.setItem('authUser', JSON.stringify(userDataFromBackend));

      setIsAuthenticated(true);
      setUser({
        username: userDataFromBackend.nombre,
        email: userDataFromBackend.email
      });

      return { success: true };

    } catch (err) {
      const networkError = 'Error de conexión con el servidor durante el inicio de sesión.';
      setError(networkError);
      return { success: false, error: networkError };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    setIsAuthenticated(false);
    setUser(null);
    setError(null);
  };

  const register = async (userData) => {
    setError(null);
    const REGISTER_URL = 'http://localhost:3000/api/auth/register';

    try {
      const response = await fetch(REGISTER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      const responseData = await response.json();

      if (!response.ok) {
        if (Array.isArray(responseData.errors)) {
          return { success: false, errors: responseData.errors };
        }

        const errorMessage = responseData.message || `Error del servidor (${response.status}).`;
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }

      return { success: true };
      } catch (err) {
      const networkError = 'Error de conexión con el servidor.';
      setError(networkError);
      return { success: false, error: networkError };
    }
};



  const fetchAuth = (url, options = {}) => {
    const token = localStorage.getItem('authToken');
    const newOptions = {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': token ? `Bearer ${token}` : '',
      },
    };

    return fetch(url, newOptions);
  };

  const value = useMemo(() => ({
    isAuthenticated,
    user,
    error,
    login,
    logout,
    register,
    fetchAuth,
    isLoading,
    setError
  }), [isAuthenticated, user, error, isLoading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

function useAuthInternal() {
  return useContext(AuthContext);
}

export const useAuth = () => useContext(AuthContext);

export const AuthPage = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center mt-20">
        <div className="w-full max-w-lg bg-white p-8 rounded-2xl shadow-2xl text-center border-l-4 border-red-500">
          <LogIn className="w-10 h-10 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Acceso Requerido</h2>
          <p className="text-gray-600 mb-4">
            Debes iniciar sesión para ver esta página de administración.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition duration-150"
          >
            Ir a Iniciar Sesión
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};



