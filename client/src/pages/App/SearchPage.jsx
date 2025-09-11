import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import UserCard from '../../components/User/UserCard';
import api from '../../api/api';

const SearchPage = () => {
  const { user } = useContext(AuthContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [searchType, setSearchType] = useState('all'); // 'all', 'skills_offered', 'skills_wanted'

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      // Si no hay término de búsqueda, mostrar todos los usuarios (excepto el usuario actual)
      setFilteredUsers(users.filter(u => u._id !== user?._id));
    } else {
      performSearch();
    }
  }, [searchTerm, users, searchType, user]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users');
      // Filtrar para no mostrar al usuario actual
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
      // Buscar en habilidades que ofrecen
      const skillsOfferedMatches = users.filter(user => 
        user.skills_to_offer && 
        user.skills_to_offer.some(skill => 
          skill.toLowerCase().includes(searchTermLower)
        )
      );
      results = [...results, ...skillsOfferedMatches];
    }

    if (searchType === 'all' || searchType === 'skills_wanted') {
      // Buscar en habilidades que quieren aprender
      const skillsWantedMatches = users.filter(user => 
        user.skills_to_learn && 
        user.skills_to_learn.some(skill => 
          skill.toLowerCase().includes(searchTermLower)
        )
      );
      results = [...results, ...skillsWantedMatches];
    }

    // También buscar por nombre
    if (searchType === 'all') {
      const nameMatches = users.filter(user => 
        user.name && user.name.toLowerCase().includes(searchTermLower)
      );
      results = [...results, ...nameMatches];
    }

    // Eliminar duplicados y filtrar el usuario actual
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

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="text-muted">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4 bg-light min-vh-100">
      <div className="row">
        <div className="col-12">
          {/* Header de búsqueda */}
          <div className="text-center mb-5">
            <h1 className="h2 text-dark mb-3">
              <i className="fas fa-search text-primary me-2"></i>
              Encuentra tu próximo intercambio
            </h1>
            <p className="lead text-muted">
              Busca personas con las habilidades que quieres aprender o que quieran aprender lo que sabes
            </p>
          </div>

          {/* Barra de búsqueda */}
          <div className="row justify-content-center mb-4">
            <div className="col-lg-8 col-xl-6">
              <div className="card shadow-sm">
                <div className="card-body">
                  <div className="input-group mb-3">
                    <span className="input-group-text bg-primary text-white">
                      <i className="fas fa-search"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      placeholder="Buscar por habilidad (ej. Piano, Cocina, Programación, Inglés...)"
                      value={searchTerm}
                      onChange={handleSearchChange}
                    />
                    {searchTerm && (
                      <button 
                        className="btn btn-outline-secondary"
                        type="button"
                        onClick={clearSearch}
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    )}
                  </div>

                  {/* Filtros de búsqueda */}
                  <div className="d-flex justify-content-center flex-wrap gap-2">
                    <button
                      className={`btn btn-sm ${searchType === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => handleSearchTypeChange('all')}
                    >
                      <i className="fas fa-globe me-1"></i>
                      Todo
                    </button>
                    <button
                      className={`btn btn-sm ${searchType === 'skills_offered' ? 'btn-success' : 'btn-outline-success'}`}
                      onClick={() => handleSearchTypeChange('skills_offered')}
                    >
                      <i className="fas fa-hand-holding me-1"></i>
                      Habilidades Ofrecidas
                    </button>
                    <button
                      className={`btn btn-sm ${searchType === 'skills_wanted' ? 'btn-info' : 'btn-outline-info'}`}
                      onClick={() => handleSearchTypeChange('skills_wanted')}
                    >
                      <i className="fas fa-graduation-cap me-1"></i>
                      Quieren Aprender
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Indicador de búsqueda */}
          {searching && (
            <div className="text-center mb-4">
              <div className="spinner-border spinner-border-sm text-primary me-2"></div>
              <span className="text-muted">Buscando...</span>
            </div>
          )}

          {/* Resultados de búsqueda */}
          <div className="row">
            <div className="col-12 mb-3">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0 text-dark">
                  {searchTerm ? (
                    <>
                      Resultados para "{searchTerm}" ({filteredUsers.length} {filteredUsers.length === 1 ? 'persona encontrada' : 'personas encontradas'})
                    </>
                  ) : (
                    <>
                      Todos los usuarios disponibles ({filteredUsers.length})
                    </>
                  )}
                </h5>
                
                {searchTerm && (
                  <small className="text-muted">
                    <i className="fas fa-filter me-1"></i>
                    Filtro: {searchType === 'all' ? 'Búsqueda global' : 
                            searchType === 'skills_offered' ? 'Solo habilidades ofrecidas' : 
                            'Solo habilidades que quieren aprender'}
                  </small>
                )}
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="row justify-content-center">
              <div className="col-md-6">
                <div className="alert alert-danger" role="alert">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  {error}
                </div>
              </div>
            </div>
          )}

          {/* Grid de usuarios */}
          {filteredUsers.length === 0 && !loading && (
            <div className="text-center py-5">
              <div className="mb-4">
                <i className="fas fa-search text-muted" style={{ fontSize: '4rem' }}></i>
              </div>
              <h4 className="text-muted mb-3">
                {searchTerm ? 'No se encontraron resultados' : 'No hay usuarios disponibles'}
              </h4>
              <p className="text-muted mb-4">
                {searchTerm 
                  ? `Intenta con otros términos de búsqueda o cambia el filtro`
                  : 'Parece que aún no hay otros usuarios registrados'
                }
              </p>
              {searchTerm && (
                <button 
                  className="btn btn-primary"
                  onClick={clearSearch}
                >
                  <i className="fas fa-times me-2"></i>
                  Limpiar búsqueda
                </button>
              )}
            </div>
          )}

          <div className="row">
            {filteredUsers.map((userData) => (
              <div key={userData._id} className="col-xl-3 col-lg-4 col-md-6 mb-4">
                <UserCard user={userData} />
              </div>
            ))}
          </div>

          {/* Sugerencias de búsqueda */}
          {searchTerm === '' && filteredUsers.length > 0 && (
            <div className="row justify-content-center mt-5">
              <div className="col-lg-8">
                <div className="card bg-primary text-white">
                  <div className="card-body text-center">
                    <h5 className="card-title">
                      <i className="fas fa-lightbulb me-2"></i>
                      Consejos de búsqueda
                    </h5>
                    <p className="card-text mb-0">
                      Prueba buscar: "JavaScript", "Cocina", "Inglés", "Piano", "Fotografía", "Marketing", etc.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
