import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
<<<<<<< HEAD
import { FaUser, FaSearch, FaTachometerAlt, FaExchangeAlt, FaStar, FaBell, FaCog, FaSignOutAlt, FaCheck, FaTimes } from 'react-icons/fa';
import { showConfirmAlert } from '../../utils/sweetAlert';
import exchangeService from '../../services/exchangeService';
=======
>>>>>>> 8be2632a23ad0f0a877621d5db145efe8ff24e19

const Header = () => {
  const { user, logout, loading } = useContext(AuthContext); // Añade 'loading'
  const navigate = useNavigate();
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationRef = useRef(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (user) {
        try {
          const receivedExchanges = await exchangeService.getReceivedExchanges();
          // Simular notificaciones - en un caso real vendrían del backend
          const mockNotifications = receivedExchanges.slice(0, 5).map(exchange => ({
            id: exchange._id,
            type: 'exchange_request',
            title: 'Nueva solicitud de intercambio',
            message: `${exchange.sender.name} quiere intercambiar habilidades contigo`,
            time: new Date(exchange.date).toLocaleDateString(),
            read: false,
            data: exchange
          }));
          
          setNotifications(mockNotifications);
          setUnreadCount(mockNotifications.filter(n => !n.read).length);
        } catch (error) {
          console.error('Error cargando notificaciones:', error);
        }
      }
    };
    
    fetchNotifications();
  }, [user]);

  const handleLogout = async () => {
    const result = await showConfirmAlert(
      '¿Cerrar sesión?',
      '¿Estás seguro de que quieres cerrar tu sesión?'
    );
    
    if (result.isConfirmed) {
      logout();
      navigate('/login');
    }
  };
  
  const isActivePath = (path) => {
    return location.pathname === path ? 'active' : '';
  };
  
  const markNotificationAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };
  
  const handleNotificationClick = (notification) => {
    markNotificationAsRead(notification.id);
    if (notification.type === 'exchange_request') {
      navigate('/dashboard');
    }
  };

  return (
<<<<<<< HEAD
    <header className="bg-white shadow-sm sticky-top">
      <nav className="navbar navbar-expand-lg navbar-light py-3">
        <div className="container">
          {/* Logo/Brand */}
          <Link 
            to={user ? "/dashboard" : "/"} 
            className="navbar-brand d-flex align-items-center text-decoration-none"
          >
            <FaExchangeAlt className="text-primary me-2" size={24} />
            <span className="fs-4 fw-bold text-dark">SkillExchange</span>
=======
    <header className="bg-white shadow-sm py-3">
      <nav className="navbar navbar-expand-lg navbar-light">
        <div className="container-fluid">
          <Link to={user ? "/dashboard" : "/"} className="navbar-brand fs-4 fw-bold text-dark">
            Skill Exchange
>>>>>>> 8be2632a23ad0f0a877621d5db145efe8ff24e19
          </Link>

          <button 
            className="navbar-toggler" 
            type="button" 
            data-bs-toggle="collapse" 
            data-bs-target="#navbarNav" 
            aria-controls="navbarNav" 
            aria-expanded="false" 
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarNav">
<<<<<<< HEAD
            {user ? (
              // Menu para usuarios autenticados
              <>
                <ul className="navbar-nav me-auto mb-2 mb-lg-0">
=======
            <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
              {/* Muestra los enlaces de usuario solo si no está cargando y el usuario existe */}
              {user && !loading ? (
                <>
>>>>>>> 8be2632a23ad0f0a877621d5db145efe8ff24e19
                  <li className="nav-item">
                    <Link 
                      to="/dashboard" 
                      className={`nav-link d-flex align-items-center px-3 py-2 rounded-pill transition-all ${
                        isActivePath('/dashboard') ? 'bg-primary text-white' : 'text-secondary hover-bg-light'
                      }`}
                    >
                      <FaTachometerAlt className="me-2" size={16} />
                      Dashboard
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link 
                      to="/search" 
                      className={`nav-link d-flex align-items-center px-3 py-2 rounded-pill transition-all ${
                        isActivePath('/search') ? 'bg-primary text-white' : 'text-secondary hover-bg-light'
                      }`}
                    >
                      <FaSearch className="me-2" size={16} />
                      Explorar
                    </Link>
                  </li>
                  {user && (
                  <li className="nav-item">
<<<<<<< HEAD
                    <Link 
                      to="/skills/add" 
                      className={`nav-link d-flex align-items-center px-3 py-2 rounded-pill transition-all ${
                        isActivePath('/skills/add') ? 'bg-primary text-white' : 'text-secondary hover-bg-light'
                      }`}
                    >
                      <FaStar className="me-2" size={16} />
                      Publicar
                    </Link>
                  </li>
                </ul>

                <div className="d-flex align-items-center gap-2">
                  {/* Dropdown de Notificaciones */}
                  <div className="dropdown">
                    <button 
                      className="btn btn-outline-primary position-relative"
                      type="button"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                      title="Notificaciones"
                      ref={notificationRef}
                    >
                      <FaBell size={16} />
                      {unreadCount > 0 && (
                        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" 
                              style={{ fontSize: '0.6rem' }}>
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
=======
                    {/* El enlace de Perfil ahora solo se renderiza si user.id existe */}
                    <Link to={`/profile/${user._id}`} className="nav-link text-secondary">
                      Perfil
                    </Link>
                  </li>
                  )}
                  <li className="nav-item ms-lg-3">
                    <button onClick={handleLogout} className="btn btn-primary rounded-pill px-4">
                      Cerrar Sesión
>>>>>>> 8be2632a23ad0f0a877621d5db145efe8ff24e19
                    </button>
                    
                    <div className="dropdown-menu dropdown-menu-end shadow-lg border-0" 
                         style={{ minWidth: '320px', maxWidth: '400px' }}>
                      <div className="dropdown-header d-flex justify-content-between align-items-center">
                        <h6 className="mb-0 fw-bold">Notificaciones</h6>
                        {unreadCount > 0 && (
                          <span className="badge bg-primary">{unreadCount} nueva{unreadCount !== 1 ? 's' : ''}</span>
                        )}
                      </div>
                      <div className="dropdown-divider"></div>
                      
                      {notifications.length > 0 ? (
                        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                          {notifications.map((notification) => (
                            <div 
                              key={notification.id}
                              className={`dropdown-item-text p-3 border-bottom cursor-pointer ${
                                !notification.read ? 'bg-light' : ''
                              }`}
                              onClick={() => handleNotificationClick(notification)}
                              style={{ cursor: 'pointer' }}
                            >
                              <div className="d-flex justify-content-between align-items-start">
                                <div className="flex-grow-1">
                                  <h6 className="mb-1 fw-semibold" style={{ fontSize: '0.9rem' }}>
                                    {notification.title}
                                  </h6>
                                  <p className="mb-1 text-muted" style={{ fontSize: '0.8rem' }}>
                                    {notification.message}
                                  </p>
                                  <small className="text-muted">{notification.time}</small>
                                </div>
                                {!notification.read && (
                                  <div className="bg-primary rounded-circle" 
                                       style={{ width: '8px', height: '8px' }}></div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-muted">
                          <FaBell className="mb-2" size={24} />
                          <p className="mb-0 small">No hay notificaciones</p>
                        </div>
                      )}
                      
                      {notifications.length > 0 && (
                        <>
                          <div className="dropdown-divider"></div>
                          <div className="text-center p-2">
                            <Link to="/dashboard" className="btn btn-sm btn-outline-primary">
                              Ver todas
                            </Link>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* User Menu Dropdown */}
                  <div className="dropdown">
                    <button
                      className="btn d-flex align-items-center text-secondary border-0 bg-transparent p-2 rounded-3"
                      type="button"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                      ref={userMenuRef}
                      style={{ 
                        transition: 'all 0.2s ease',
                        '&:hover': { backgroundColor: '#f8f9fa' }
                      }}
                    >
                      {user.avatar ? (
                        <img 
                          src={user.avatar} 
                          alt={user.name} 
                          className="rounded-circle me-2 border"
                          width="36"
                          height="36"
                          style={{ objectFit: 'cover' }}
                        />
                      ) : (
                        <div className="bg-gradient-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2 border" 
                             style={{ width: '36px', height: '36px', fontSize: '14px', fontWeight: 'bold' }}>
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="text-start d-none d-md-block">
                        <div className="fw-semibold" style={{ fontSize: '0.9rem' }}>{user.name}</div>
                        {user.averageRating > 0 && (
                          <div className="d-flex align-items-center" style={{ fontSize: '0.75rem' }}>
                            <FaStar className="text-warning me-1" size={10} />
                            <span className="text-muted">{user.averageRating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                    </button>
                    
                    <ul className="dropdown-menu dropdown-menu-end shadow-lg border-0 mt-2" 
                        style={{ minWidth: '250px' }}>
                      <li>
                        <div className="dropdown-header text-center py-3">
                          {user.avatar ? (
                            <img 
                              src={user.avatar} 
                              alt={user.name} 
                              className="rounded-circle border mb-2"
                              width="60"
                              height="60"
                              style={{ objectFit: 'cover' }}
                            />
                          ) : (
                            <div className="bg-gradient-primary text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-2" 
                                 style={{ width: '60px', height: '60px', fontSize: '24px', fontWeight: 'bold' }}>
                              {user.name?.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <h6 className="mb-1 fw-bold">{user.name}</h6>
                          {user.averageRating > 0 && (
                            <div className="d-flex align-items-center justify-content-center">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <FaStar
                                  key={star}
                                  className={star <= user.averageRating ? 'text-warning' : 'text-muted'}
                                  size={12}
                                />
                              ))}
                              <span className="ms-2 small text-muted">
                                {user.averageRating.toFixed(1)} ({user.totalRatings || 0})
                              </span>
                            </div>
                          )}
                        </div>
                      </li>
                      <li><hr className="dropdown-divider" /></li>
                      <li>
                        <Link 
                          to={`/profile/${user._id}`} 
                          className="dropdown-item d-flex align-items-center py-2 px-3"
                        >
                          <FaUser className="me-3 text-primary" size={16} />
                          <div>
                            <div className="fw-semibold">Mi Perfil</div>
                            <small className="text-muted">Ver y editar perfil</small>
                          </div>
                        </Link>
                      </li>
                      <li>
                        <Link 
                          to="/profile/edit" 
                          className="dropdown-item d-flex align-items-center py-2 px-3"
                        >
                          <FaCog className="me-3 text-secondary" size={16} />
                          <div>
                            <div className="fw-semibold">Configuración</div>
                            <small className="text-muted">Ajustar preferencias</small>
                          </div>
                        </Link>
                      </li>
                      <li><hr className="dropdown-divider" /></li>
                      <li>
                        <button 
                          onClick={handleLogout} 
                          className="dropdown-item d-flex align-items-center py-2 px-3 text-danger"
                        >
                          <FaSignOutAlt className="me-3" size={16} />
                          <div>
                            <div className="fw-semibold">Cerrar Sesión</div>
                            <small>Salir de tu cuenta</small>
                          </div>
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              </>
            ) : (
              // Menu para usuarios no autenticados
              <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
                <li className="nav-item">
                  <Link to="/register" className="nav-link text-secondary me-3 px-3 py-2">
                    Registrarse
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/login" className="btn btn-primary rounded-pill px-4 py-2">
                    Iniciar Sesión
                  </Link>
                </li>
              </ul>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
