import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const RegisterPage = () => {
  // Lista de códigos de país comunes
  const countryCodes = [
    { code: '+52', name: 'México (+52)' },
    { code: '+1', name: 'Estados Unidos/Canadá (+1)' },
    { code: '+34', name: 'España (+34)' },
    { code: '+54', name: 'Argentina (+54)' },
    { code: '+55', name: 'Brasil (+55)' },
    { code: '+56', name: 'Chile (+56)' },
    { code: '+57', name: 'Colombia (+57)' },
    { code: '+58', name: 'Venezuela (+58)' },
    { code: '+51', name: 'Perú (+51)' },
    { code: '+591', name: 'Bolivia (+591)' },
    { code: '+593', name: 'Ecuador (+593)' },
    { code: '+595', name: 'Paraguay (+595)' },
    { code: '+598', name: 'Uruguay (+598)' },
    { code: '+503', name: 'El Salvador (+503)' },
    { code: '+504', name: 'Honduras (+504)' },
    { code: '+505', name: 'Nicaragua (+505)' },
    { code: '+506', name: 'Costa Rica (+506)' },
    { code: '+507', name: 'Panamá (+507)' },
    { code: '+53', name: 'Cuba (+53)' },
    { code: '+502', name: 'Guatemala (+502)' }
  ];

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    countryCode: '+52', // Código por defecto para México
    bio: '',
    skills_to_offer: '',
    skills_to_learn: ''
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await register(formData);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-lg">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Regístrate</h2>
          <p className="text-gray-600">Únete a nuestra comunidad de intercambio de habilidades</p>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            <div className="flex items-center">
              <i className="fas fa-exclamation-triangle mr-2"></i>
              {error}
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
              <i className="fas fa-user text-blue-500 mr-2"></i>
              Nombre Completo
            </label>
            <input
              type="text"
              name="name"
              id="name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Tu nombre completo"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
              <i className="fas fa-envelope text-blue-500 mr-2"></i>
              Correo Electrónico
            </label>
            <input
              type="email"
              name="email"
              id="email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="tu@correo.com"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="countryCode" className="block text-sm font-semibold text-gray-700 mb-2">
                <i className="fas fa-flag text-blue-500 mr-2"></i>
                Código de País
              </label>
              <select
                name="countryCode"
                id="countryCode"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                value={formData.countryCode}
                onChange={handleChange}
                disabled={loading}
              >
                {countryCodes.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                <i className="fas fa-phone text-blue-500 mr-2"></i>
                Número de Teléfono
              </label>
              <input
                type="tel"
                name="phone"
                id="phone"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="1234567890"
                value={formData.phone}
                onChange={handleChange}
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Tu número será privado y solo se compartirá con usuarios que aceptes.
              </p>
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
              <i className="fas fa-lock text-blue-500 mr-2"></i>
              Contraseña
            </label>
            <input
              type="password"
              name="password"
              id="password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Mínimo 6 caracteres"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
            />
            <p className="text-sm text-gray-500 mt-1">Debe tener al menos 6 caracteres</p>
          </div>

          <div>
            <label htmlFor="bio" className="block text-sm font-semibold text-gray-700 mb-2">
              <i className="fas fa-quote-right text-blue-500 mr-2"></i>
              Biografía (Opcional)
            </label>
            <textarea
              name="bio"
              id="bio"
              rows="3"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
              placeholder="Cuéntanos sobre ti..."
              value={formData.bio}
              onChange={handleChange}
              disabled={loading}
              maxLength="500"
            />
            <p className="text-sm text-gray-500 mt-1">{formData.bio.length}/500 caracteres</p>
          </div>
          
          <div>
            <label htmlFor="skills_to_offer" className="block text-sm font-semibold text-gray-700 mb-2">
              <i className="fas fa-gift text-green-500 mr-2"></i>
              Habilidades que ofreces
            </label>
            <input
              type="text"
              name="skills_to_offer"
              id="skills_to_offer"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Ej: JavaScript, Cocina, Inglés (separadas por comas)"
              value={formData.skills_to_offer}
              onChange={handleChange}
              disabled={loading}
            />
            <p className="text-sm text-gray-500 mt-1">Opcional - separa con comas</p>
          </div>
          
          <div>
            <label htmlFor="skills_to_learn" className="block text-sm font-semibold text-gray-700 mb-2">
              <i className="fas fa-graduation-cap text-purple-500 mr-2"></i>
              Habilidades que quieres aprender
            </label>
            <input
              type="text"
              name="skills_to_learn"
              id="skills_to_learn"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Ej: Piano, Fotografía, Python (separadas por comas)"
              value={formData.skills_to_learn}
              onChange={handleChange}
              disabled={loading}
            />
            <p className="text-sm text-gray-500 mt-1">Opcional - separa con comas</p>
          </div>
          
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Registrando...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <i className="fas fa-user-plus mr-2"></i>
                Crear Cuenta
              </div>
            )}
          </button>
        </form>
        
        <div className="text-center mt-6">
          <p className="text-gray-600">
            ¿Ya tienes una cuenta?{' '}
            <Link 
              to="/login" 
              className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-colors"
            >
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
