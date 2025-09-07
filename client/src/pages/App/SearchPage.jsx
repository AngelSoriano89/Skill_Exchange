import React, { useState, useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';
import api from '../../api/api'; // Asegúrate de que esta ruta sea correcta
import UserCard from '../../components/User/UserCard'; // Importa el componente de tarjeta

const SearchPage = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Al cargar el componente, obtiene todos los usuarios
    const fetchUsers = async () => {
      try {
        const res = await api.get('/users'); // Asume que tienes una ruta para obtener todos los usuarios
        setUsers(res.data);
      } catch (err) {
        console.error('Error al obtener los usuarios:', err);
      }
    };
    fetchUsers();
  }, []);

  const handleSearch = async () => {
    try {
      const res = await api.get(`/users/search?skill=${searchQuery}`);
      setUsers(res.data);
    } catch (err) {
      console.error('Error al buscar usuarios:', err);
    }
  };

  return (
    <div className="d-flex flex-column align-items-center bg-light w-100 p-4 min-vh-100">
      <div className="container py-5">
        <h1 className="h2 fw-bold text-dark text-center mb-4">
          Encuentra tu próximo intercambio
        </h1>
        <div className="d-flex justify-content-center mb-5">
          <div className="input-group" style={{ maxWidth: '600px' }}>
            <span className="input-group-text bg-white border-end-0 border-rounded-end">
              <FaSearch />
            </span>
            <input
              type="text"
              placeholder="Buscar por habilidad (ej. Piano, Cocina, Programación)"
              className="form-control border-start-0 py-2"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button onClick={handleSearch} className="btn btn-primary rounded-end-pill px-4">
              Buscar
            </button>
          </div>
        </div>

        <div className="row g-4 justify-content-center">
          {users.length > 0 ? (
            users.map((user) => (
              <div key={user._id} className="col-12 col-sm-6 col-md-4 col-lg-3">
                <UserCard user={user} />
              </div>
            ))
          ) : (
            <p className="text-muted text-center">No se encontraron usuarios.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
