import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-dark text-white p-4 text-center mt-auto shadow-sm">
      <p>&copy; {new Date().getFullYear()} Skill Exchange. Todos los derechos reservados.</p>
    </footer>
  );
};

export default Footer;
