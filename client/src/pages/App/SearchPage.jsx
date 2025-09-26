import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import UserCard from '../../components/User/UserCard';
import api from '../../api/api.jsx';
import { ENDPOINTS } from '../../api/api';

const SearchPage = () => {
  const { user } = useContext(AuthContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [searchType, setSearchType] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(users.filter(u => u._id !== user?._id));
    } else {
      performSearch();
    }
  }, [searchTerm, users, searchType, user]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get(ENDPOINTS.users.list);
      const allUsers = response.data.filter(u => u._id !== user?._id);
      setUsers(allUsers);
      setFilteredUsers(allUsers);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Error al cargar los usuarios');
    } finally {
      setLoading(false);
    }
  };

  const performSearch = () => {
    setSearching(true);
    
    const searchTermLower = searchTerm.toLowerCase().trim();
    let results = [];

    if (searchType === 'all' || searchType === 'skills_offered') {
      const skillsOfferedMatches = users.filter(user => 
        user.skills_to_offer && 
        user.skills_to_offer.some(skill => 
          skill.toLowerCase().includes(searchTermLower)
        )
      );
      results = [...results, ...skillsOfferedMatches];
    }

    if (searchType === 'all' || searchType === 'skills_wanted') {
      const skillsWantedMatches = users.filter(user => 
        user.skills_to_learn && 
        user.skills_to_learn.some(skill => 
          skill.toLowerCase().includes(searchTermLower)
        )
      );
      results = [...results, ...skillsWantedMatches];
    }

    if (searchType === 'all') {
      const nameMatches = users.filter(user => 
        user.name && user.name.toLowerCase().includes(searchTermLower)
      );
      const bioMatches = users.filter(user => 
        user.bio && user.bio.toLowerCase().includes(searchTermLower)
      );
      results = [...results, ...nameMatches, ...bioMatches];
    }

    const uniqueResults = results
      .filter((user, index, self) => 
        index === self.findIndex(u => u._id === user._id)
      )
      .filter(u => u._id !== user?._id);

    setFilteredUsers(uniqueResults);
    setSearching(false);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchTypeChange = (type) => {
    setSearchType(type);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSearchType('all');
  };

  const popularSkills = [
    'JavaScript', 'Python', 'Cocina', 'Inglés', 'Piano', 'Fotografía', 
    'Marketing', 'Diseño Gráfico', 'Yoga', 'Guitarra'
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in-up">
          <h1 className="text-4xl font-bold gradient-text mb-4">
            <i className="fas fa-search mr-3"></i>
            Encuentra tu próximo intercambio
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Conecta con personas increíbles y aprende habilidades nuevas mientras compartes las tuyas
          </p>
        </div>

        {/* Barra de búsqueda */}
        <div className="max-w-4xl mx-auto mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="card p-6">
            <div className="relative mb-6">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <i className="fas fa-search text-gray-400 text-xl"></i>
              </div>
              <input
                type="text"
                className="block w-full pl-12 pr-12 py-4 text-lg border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                placeholder="Buscar por habilidad (ej. Piano, Cocina, Programación, Inglés...)"
                value={searchTerm}
                onChange={handleSearchChange}
              />
              {searchTerm && (
                <button 
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={clearSearch}
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              )}
            </div>

            {/* Filtros de búsqueda */}
            <div className="flex flex-wrap justify-center gap-3 mb-4">
              <button
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  searchType === 'all' 
                    ? 'bg-primary-600 text-white shadow-lg' 
                    : 'bg-white text-gray-600 border border-gray-300 hover:border-primary-300 hover:text-primary-600'
                }`}
                onClick={() => handleSearchTypeChange('all')}
              >
                <i className="fas fa-globe mr-2"></i>
                Todo
              </button>
              <button
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  searchType === 'skills_offered' 
                    ? 'bg-green-600 text-white shadow-lg' 
                    : 'bg-white text-gray-600 border border-gray-300 hover:border-green-300 hover:text-green-600'
                }`}
                onClick={() => handleSearchTypeChange('skills_offered')}
              >
                <i className="fas fa-hand-holding mr-2"></i>
                Habilidades Ofrecidas
              </button>
              <button
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  searchType === 'skills_wanted' 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'bg-white text-gray-600 border border-gray-300 hover:border-blue-300 hover:text-blue-600'
                }`}
                onClick={() => handleSearchTypeChange('skills_wanted')}
              >
                <i className="fas fa-graduation-cap mr-2"></i>
                Quieren Aprender
              </button>
            </div>

            {/* Sugerencias de búsqueda */}
            {!searchTerm && (
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-3">Habilidades populares:</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {popularSkills.map((skill) => (
                    <button
                      key={skill}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-primary-100 hover:text-primary-700 transition-colors"
                      onClick={() => setSearchTerm(skill)}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Indicador de búsqueda */}
        {searching && (
          <div className="text-center mb-6">
            <div className="inline-flex items-center text-primary-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600 mr-2"></div>
              <span className="font-medium">Buscando...</span>
            </div>
          </div>
        )}

        {/* Resultados */}
        <div className="mb-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 md:mb-0">
              {searchTerm ? (
                <>
                  Resultados para "<span className="text-primary-600">{searchTerm}</span>"
                </>
              ) : (
                'Todos los usuarios disponibles'
              )}
            </h2>
            
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">
                <span className="font-semibold text-primary-600">{filteredUsers.length}</span> 
                {filteredUsers.length === 1 ? ' persona encontrada' : ' personas encontradas'}
              </span>
              
              {searchTerm && (
                <div className="flex items-center text-sm text-gray-500">
                  <i className="fas fa-filter mr-1"></i>
                  {searchType === 'all' ? 'Búsqueda global' : 
                   searchType === 'skills_offered' ? 'Solo habilidades ofrecidas' : 
                   'Solo habilidades que quieren aprender'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <i className="fas fa-exclamation-triangle text-red-500 text-2xl mb-2"></i>
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Grid de usuarios */}
        {filteredUsers.length === 0 && !loading ? (
          <div className="text-center py-16 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="max-w-lg mx-auto">
              <div className="mb-6">
                <i className="fas fa-search text-gray-300 text-6xl mb-4"></i>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {searchTerm ? 'No se encontraron resultados' : 'No hay usuarios disponibles'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm 
                    ? 'Intenta con otros términos de búsqueda o cambia el filtro'
                    : 'Parece que aún no hay otros usuarios registrados'
                  }
                </p>
              </div>
              
              {searchTerm ? (
                <div className="space-y-4">
                  <button 
                    className="btn-primary mx-auto"
                    onClick={clearSearch}
                  >
                    <i className="fas fa-times mr-2"></i>
                    Limpiar búsqueda
                  </button>
                  <div>
                    <p className="text-sm text-gray-500 mb-2">¿Buscabas algo diferente? Prueba:</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {popularSkills.slice(0, 5).map((skill) => (
                        <button
                          key={skill}
                          className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm hover:bg-primary-200 transition-colors"
                          onClick={() => setSearchTerm(skill)}
                        >
                          {skill}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="card p-8">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">¡Sé el primero en intercambiar!</h4>
                  <p className="text-gray-600 mb-4">
                    Invita a tus amigos a unirse a Skill Exchange y comienza a intercambiar conocimientos.
                  </p>
                  <button className="btn-primary">
                    <i className="fas fa-share-alt mr-2"></i>
                    Invitar amigos
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {filteredUsers.map((userData, index) => (
                <div 
                  key={userData._id} 
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${0.1 * (index % 8)}s` }}
                >
                  <UserCard user={userData} />
                </div>
              ))}
            </div>

            {/* Paginación futura */}
            {filteredUsers.length > 12 && (
              <div className="text-center">
                <p className="text-gray-500 mb-4">
                  Mostrando {Math.min(12, filteredUsers.length)} de {filteredUsers.length} resultados
                </p>
                {/* Aquí se podría agregar paginación en el futuro */}
              </div>
            )}
          </>
        )}

        {/* Consejos de búsqueda */}
        {searchTerm === '' && filteredUsers.length > 0 && (
          <div className="max-w-4xl mx-auto mt-12 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <div className="card p-8 text-center bg-gradient-to-r from-primary-50 to-blue-50 border-l-4 border-primary-500">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center justify-center">
                <i className="fas fa-lightbulb text-yellow-500 mr-2"></i>
                Consejos para encontrar el intercambio perfecto
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                <div className="space-y-2">
                  <h4 className="font-semibold text-primary-700">Sé específico</h4>
                  <p className="text-sm text-gray-600">
                    Busca "Guitar acústica" en lugar de solo "Guitarra" para resultados más precisos.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-green-700">Usa filtros</h4>
                  <p className="text-sm text-gray-600">
                    Filtra por "Habilidades Ofrecidas" si buscas un maestro específico.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-blue-700">Lee perfiles</h4>
                  <p className="text-sm text-gray-600">
                    Revisa las biografías para encontrar personas con intereses similares.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CTA para usuarios sin resultados */}
        {filteredUsers.length === 0 && searchTerm && (
          <div className="max-w-2xl mx-auto mt-8 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="card p-8 text-center bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400">
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                <i className="fas fa-plus-circle text-yellow-500 mr-2"></i>
                ¿No encuentras lo que buscas?
              </h3>
              <p className="text-gray-600 mb-4">
                ¡Puedes ser el primero en ofrecer "{searchTerm}"! Actualiza tu perfil y atrae a personas interesadas.
              </p>
              <button 
                className="btn-warning"
                onClick={() => window.location.href = '/profile'}
              >
                <i className="fas fa-edit mr-2"></i>
                Actualizar mi perfil
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
