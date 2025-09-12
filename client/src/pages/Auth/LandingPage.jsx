import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleRegisterClick = (e) => {
    e.preventDefault();
    navigate('/register');
  };

  const handleLoginClick = (e) => {
    e.preventDefault();
    navigate('/login');
  };

  const features = [
    {
      icon: 'fas fa-exchange-alt',
      title: 'Intercambio Justo',
      description: 'Enseña lo que sabes y aprende lo que necesitas. Un intercambio equitativo de conocimientos.'
    },
    {
      icon: 'fas fa-users',
      title: 'Comunidad Global',
      description: 'Conecta con personas de todo el mundo que comparten tus intereses y pasiones.'
    },
    {
      icon: 'fas fa-star',
      title: 'Aprendizaje de Calidad',
      description: 'Aprende de expertos reales con experiencia práctica en sus áreas.'
    },
    {
      icon: 'fas fa-heart',
      title: 'Gratis Siempre',
      description: 'Nuestra plataforma es completamente gratuita. Solo necesitas ganas de aprender y enseñar.'
    }
  ];

  const testimonials = [
    {
      name: 'María García',
      skill: 'Aprendió Programación',
      text: 'Intercambié mis clases de cocina por programación. ¡Ahora soy desarrolladora web!',
      rating: 5
    },
    {
      name: 'Carlos López',
      skill: 'Enseña Guitarra',
      text: 'He ayudado a más de 20 personas a tocar guitarra mientras aprendo idiomas.',
      rating: 5
    },
    {
      name: 'Ana Rodríguez',
      skill: 'Intercambio de Idiomas',
      text: 'Perfeccioné mi inglés enseñando español. ¡Una experiencia increíble!',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/10 to-blue-600/10"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center animate-fade-in-up">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="gradient-text">Intercambia Conocimiento.</span>
              <br />
              <span className="text-gray-800">Aprendan Juntos.</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Conéctate con personas que tienen las habilidades que quieres aprender y 
              <span className="font-semibold text-primary-600"> enseña lo que sabes</span>.
              <br />¡Es un ganar-ganar para todos! 🚀
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <button
                onClick={handleRegisterClick}
                className="btn-primary text-lg px-8 py-4 transform hover:scale-105 shadow-xl hover:shadow-2xl animate-bounce-gentle"
              >
                <i className="fas fa-rocket mr-2"></i>
                Regístrate Gratis
              </button>
              
              <button
                onClick={handleLoginClick}
                className="btn-outline-primary text-lg px-8 py-4 transform hover:scale-105"
              >
                <i className="fas fa-sign-in-alt mr-2"></i>
                Inicia Sesión
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <div className="text-3xl font-bold text-primary-600 mb-2">500+</div>
                <div className="text-gray-600">Usuarios Activos</div>
              </div>
              <div className="text-center animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                <div className="text-3xl font-bold text-green-600 mb-2">1,200+</div>
                <div className="text-gray-600">Intercambios Exitosos</div>
              </div>
              <div className="text-center animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                <div className="text-3xl font-bold text-blue-600 mb-2">50+</div>
                <div className="text-gray-600">Habilidades Diferentes</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              ¿Por qué elegir Skill Exchange?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Descubre las ventajas de formar parte de nuestra comunidad de aprendizaje colaborativo
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="card p-8 text-center hover-lift animate-fade-in-up group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <i className={`${feature.icon} text-2xl text-white`}></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gradient-to-r from-primary-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              ¿Cómo funciona?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              En solo 4 pasos simples estarás intercambiando conocimientos
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { step: 1, title: 'Regístrate', desc: 'Crea tu perfil y describe tus habilidades', icon: 'fas fa-user-plus' },
                { step: 2, title: 'Busca', desc: 'Encuentra personas con habilidades que te interesen', icon: 'fas fa-search' },
                { step: 3, title: 'Conecta', desc: 'Envía solicitudes y coordina intercambios', icon: 'fas fa-handshake' },
                { step: 4, title: 'Aprende', desc: '¡Disfruta aprendiendo y enseñando!', icon: 'fas fa-graduation-cap' }
              ].map((item, index) => (
                <div key={index} className="text-center animate-fade-in-up" style={{ animationDelay: `${index * 0.15}s` }}>
                  <div className="relative mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-blue-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                      <i className={`${item.icon} text-2xl text-white`}></i>
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-sm font-bold text-gray-900">
                      {item.step}
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Lo que dicen nuestros usuarios
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Historias reales de personas que han transformado sus vidas intercambiando conocimientos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className="card p-8 text-center hover-lift animate-fade-in-up"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-white">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div className="flex justify-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <i key={i} className="fas fa-star text-yellow-400"></i>
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 italic mb-6 leading-relaxed">"{testimonial.text}"</p>
                <div>
                  <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                  <p className="text-sm text-gray-500">{testimonial.skill}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto animate-fade-in-up">
            <h2 className="text-4xl font-bold mb-6">
              ¿Listo para comenzar tu viaje de aprendizaje?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Únete a miles de personas que ya están intercambiando conocimientos y 
              construyendo un futuro más colaborativo.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleRegisterClick}
                className="bg-white text-primary-600 hover:bg-gray-100 font-bold py-4 px-8 rounded-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                <i className="fas fa-rocket mr-2"></i>
                ¡Comenzar Ahora es Gratis!
              </button>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="border-2 border-white text-white hover:bg-white hover:text-primary-600 font-bold py-4 px-8 rounded-lg transform hover:scale-105 transition-all duration-300"
              >
                <i className="fas fa-arrow-up mr-2"></i>
                Volver al inicio
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
