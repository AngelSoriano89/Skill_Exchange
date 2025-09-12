import React, { useState, useEffect, useContext } from 'react';
import { FaSearch, FaFilter, FaMapMarkerAlt, FaStar, FaEye, FaExchangeAlt, FaTimes, FaSpinner } from 'react-icons/fa';
import { AuthContext } from '../../context/AuthContext';
import skillService from '../../services/skillService';
import { handleApiError, showInfoAlert } from '../../utils/sweetAlert';
import SkillCard from '../../components/Skill/SkillCard';

const SearchPage = () => {
  const { user } = useContext(AuthContext);
  const [skills, setSkills] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 });
  
  // Filtros
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    level: '',
    city: '',
    country: '',
    page: 1,
    limit: 12
  });
  
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [categoriesData, skillsData] = await Promise.all([
          skillService.getCategories(),
          skillService.getSkills({ page: 1, limit: 12 })
        ]);
        
        setCategories(categoriesData);
        setSkills(skillsData.skills);
        setPagination(skillsData.pagination);
      } catch (error) {
        handleApiError(error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchInitialData();
  }, []);

  const handleSearch = async (newFilters = filters) => {
    setSearchLoading(true);
    try {
      const skillsData = await skillService.getSkills(newFilters);
      setSkills(skillsData.skills);
      setPagination(skillsData.pagination);
    } catch (error) {
      handleApiError(error);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value, page: 1 };
    setFilters(newFilters);
  };

  const handlePageChange = (page) => {
    const newFilters = { ...filters, page };
    setFilters(newFilters);
    handleSearch(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      search: '',
      category: '',
      level: '',
      city: '',
      country: '',
      page: 1,
      limit: 12
    };
    setFilters(clearedFilters);
    handleSearch(clearedFilters);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="text-center">
          <FaSpinner className="fa-spin text-primary mb-3" size={48} />
          <p className="text-muted">Cargando habilidades...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-light min-vh-100">
      <div className="container py-4">
        {/* Header */}
        <div className="text-center mb-5">
          <h1 className="h2 fw-bold text-dark mb-2">
            <FaSearch className="text-primary me-2" />
            Explora Habilidades
          </h1>
          <p className="text-muted">Encuentra la habilidad perfecta para intercambiar</p>
        </div>

        {/* Barra de búsqueda principal */}
        <div className="row justify-content-center mb-4">
          <div className="col-12 col-md-8 col-lg-6">
            <div className="card shadow-sm border-0">
              <div className="card-body p-3">
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <FaSearch className="text-muted" />
                  </span>
                  <input
                    type="text"
                    placeholder="Buscar habilidades... (ej: React, Guitarra, Cocina)"
                    className="form-control border-start-0 border-end-0"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <button 
                    onClick={() => handleSearch()} 
                    className="btn btn-primary"
                    disabled={searchLoading}
                  >
                    {searchLoading ? <FaSpinner className="fa-spin" /> : 'Buscar'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros avanzados */}
        <div className="row justify-content-center mb-4">
          <div className="col-12 col-lg-10">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white border-bottom-0">
                <button
                  className="btn btn-outline-primary btn-sm w-100 d-flex align-items-center justify-content-center"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <FaFilter className="me-2" />
                  {showFilters ? 'Ocultar' : 'Mostrar'} Filtros Avanzados
                </button>
              </div>
              
              {showFilters && (
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-md-3">
                      <label className="form-label small fw-semibold">Categoría</label>
                      <select
                        className="form-select form-select-sm"
                        value={filters.category}
                        onChange={(e) => handleFilterChange('category', e.target.value)}
                      >
                        <option value="">Todas las categorías</option>
                        {categories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="col-md-3">
                      <label className="form-label small fw-semibold">Nivel</label>
                      <select
                        className="form-select form-select-sm"
                        value={filters.level}
                        onChange={(e) => handleFilterChange('level', e.target.value)}
                      >
                        <option value="">Todos los niveles</option>
                        <option value="Principiante">Principiante</option>
                        <option value="Intermedio">Intermedio</option>
                        <option value="Avanzado">Avanzado</option>
                        <option value="Experto">Experto</option>
                      </select>
                    </div>
                    
                    <div className="col-md-3">
                      <label className="form-label small fw-semibold">Ciudad</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Ciudad"
                        value={filters.city}
                        onChange={(e) => handleFilterChange('city', e.target.value)}
                      />
                    </div>
                    
                    <div className="col-md-3">
                      <label className="form-label small fw-semibold">País</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="País"
                        value={filters.country}
                        onChange={(e) => handleFilterChange('country', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="d-flex gap-2 mt-3">
                    <button
                      onClick={() => handleSearch()}
                      className="btn btn-primary btn-sm"
                      disabled={searchLoading}
                    >
                      <FaSearch className="me-1" />
                      Aplicar Filtros
                    </button>
                    <button
                      onClick={clearFilters}
                      className="btn btn-outline-secondary btn-sm"
                    >
                      <FaTimes className="me-1" />
                      Limpiar Filtros
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Resultados */}
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-semibold mb-0">
              {pagination.total > 0 ? (
                `${pagination.total} habilidad${pagination.total !== 1 ? 'es' : ''} encontrada${pagination.total !== 1 ? 's' : ''}`
              ) : (
                'No se encontraron habilidades'
              )}
            </h5>
            {pagination.total > 0 && (
              <small className="text-muted">
                Página {pagination.current} de {pagination.pages}
              </small>
            )}
          </div>

          {searchLoading ? (
            <div className="text-center py-5">
              <FaSpinner className="fa-spin text-primary mb-3" size={32} />
              <p className="text-muted">Buscando habilidades...</p>
            </div>
          ) : (
            <>
              {skills.length > 0 ? (
                <>
                  <div className="row g-4">
                    {skills.map((skill) => (
                      <div key={skill._id} className="col-12 col-md-6 col-lg-4">
                        <SkillCard skill={skill} />
                      </div>
                    ))}
                  </div>

                  {/* Paginación */}
                  {pagination.pages > 1 && (
                    <div className="d-flex justify-content-center mt-5">
                      <nav aria-label="Paginación de resultados">
                        <ul className="pagination">
                          <li className={`page-item ${pagination.current === 1 ? 'disabled' : ''}`}>
                            <button
                              className="page-link"
                              onClick={() => handlePageChange(pagination.current - 1)}
                              disabled={pagination.current === 1}
                            >
                              Anterior
                            </button>
                          </li>
                          
                          {[...Array(Math.min(pagination.pages, 5))].map((_, index) => {
                            const pageNumber = index + 1;
                            return (
                              <li key={pageNumber} className={`page-item ${pagination.current === pageNumber ? 'active' : ''}`}>
                                <button
                                  className="page-link"
                                  onClick={() => handlePageChange(pageNumber)}
                                >
                                  {pageNumber}
                                </button>
                              </li>
                            );
                          })}
                          
                          <li className={`page-item ${pagination.current === pagination.pages ? 'disabled' : ''}`}>
                            <button
                              className="page-link"
                              onClick={() => handlePageChange(pagination.current + 1)}
                              disabled={pagination.current === pagination.pages}
                            >
                              Siguiente
                            </button>
                          </li>
                        </ul>
                      </nav>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-5">
                  <FaSearch className="text-muted mb-3" size={48} />
                  <h5 className="text-muted mb-3">No se encontraron habilidades</h5>
                  <p className="text-muted mb-4">
                    Intenta ajustar tus filtros de búsqueda o explora todas las categorías
                  </p>
                  <button
                    onClick={clearFilters}
                    className="btn btn-outline-primary"
                  >
                    <FaTimes className="me-2" />
                    Limpiar Filtros
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
