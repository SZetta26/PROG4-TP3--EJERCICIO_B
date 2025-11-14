import { useState } from 'react';
import { AuthProvider, useAuth } from './Auth.jsx';
import Login from './Login.jsx';
import Register from './Register.jsx';
import ListaPacientes from './ListaPacientes.jsx';
import ListaMedicos from './ListaMedicos.jsx';
import ListaTurnos from './ListaTurnos.jsx';
import { Home, CalendarCheck, User, LogOut, LogIn, Menu, X, Stethoscope } from 'lucide-react';

const HomeContent = ({ setCurrentPage }) => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="mt-10">
      <div className="bg-white p-8 rounded-2xl shadow-2xl">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
          Bienvenido al Sistema de Gestión Clínica!
        </h1>
        {isAuthenticated ? (
          <div className="space-y-4">
            <p className="text-xl text-gray-700">
              Hola, <span className="font-semibold text-indigo-600">{user?.username || 'Usuario'}</span>.
            </p>
            <p className="text-lg font-bold text-red-600">
              Tu perfil de acceso es: ADMINISTRADOR.
            </p>
            <p className="text-gray-600">
              Utiliza la barra de navegación para acceder a todos los módulos de gestión.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xl text-gray-700">
              Por favor, inicia sesión para acceder a las herramientas.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setCurrentPage('login')}
                className="px-6 py-3 text-lg font-bold rounded-lg shadow-xl transition duration-150 bg-indigo-600 text-white hover:bg-indigo-700 transform hover:scale-[1.02]"
              >
                <LogIn className="w-5 h-5 inline mr-2" /> Iniciar Sesión
              </button>
              <button
                onClick={() => setCurrentPage('register')}
                className="px-6 py-3 text-lg font-bold rounded-lg shadow-xl transition duration-150 bg-teal-600 text-white hover:bg-teal-700 transform hover:scale-[1.02]"
              >
                <User className="w-5 h-5 inline mr-2" /> Registrarse
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const AppContent = () => {
  const { isAuthenticated, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const renderPage = () => {
    if (!isAuthenticated) {
      return currentPage === 'register'
        ? <Register setCurrentPage={setCurrentPage} />
        : <Login setCurrentPage={setCurrentPage} />;
    }

    switch (currentPage) {
      case 'pacientes':
        return <ListaPacientes />;
      case 'medicos':
        return <ListaMedicos />;
      case 'turnos':
        return <ListaTurnos />;
      case 'home':
      default:
        return <HomeContent setCurrentPage={setCurrentPage} />;
    }
  };

  const getNavLinks = () => [
    { id: 'home', label: 'Inicio', icon: Home },
    ...(isAuthenticated ? [
      { id: 'turnos', label: 'Gestión de Turnos', icon: CalendarCheck },
      { id: 'pacientes', label: 'Pacientes', icon: User },
      { id: 'medicos', label: 'Médicos', icon: Stethoscope },
    ] : [])
  ];

  return (
    <div className="min-h-screen bg-gray-100 font-sans antialiased">
      <header className="bg-white shadow-md sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <span
              className="text-2xl font-bold text-indigo-600 cursor-pointer"
              onClick={() => setCurrentPage('home')}
            >
              🏥 Gestión Clínica
            </span>

            <nav className="hidden md:flex space-x-6">
              {getNavLinks().map(link => (
                <a
                  key={link.id}
                  href="#"
                  onClick={() => setCurrentPage(link.id)}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition duration-150 
                    ${currentPage === link.id
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-indigo-600'}`}
                >
                  <link.icon className="w-5 h-5 mr-1" />
                  {link.label}
                </a>
              ))}
            </nav>

            <div className="flex items-center">
              {isAuthenticated ? (
                <>
                  <span className="hidden sm:flex items-center text-sm mr-4">
                    <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-800">
                      ADMINISTRADOR
                    </span>
                  </span>
                  <button
                    onClick={logout}
                    className="hidden sm:flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg shadow-md hover:bg-red-700 transition duration-150"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Cerrar Sesión
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setCurrentPage('login')}
                  className="flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg shadow-md hover:bg-indigo-700 transition duration-150"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Iniciar Sesión
                </button>
              )}

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 ml-4"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-xl absolute w-full z-30">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {getNavLinks().map(link => (
              <a
                key={link.id}
                href="#"
                onClick={() => { setCurrentPage(link.id); setIsMenuOpen(false); }}
                className={`flex items-center w-full px-3 py-2 text-base font-medium rounded-lg transition duration-150 
                  ${currentPage === link.id
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-indigo-600'}`}
              >
                <link.icon className="w-5 h-5 mr-3" />
                {link.label}
              </a>
            ))}
          </div>
        </div>
      )}

      <main className="pt-4 pb-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {renderPage()}
        </div>
      </main>
    </div>
  );
};

const App = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;

