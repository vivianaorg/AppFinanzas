import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const NavigationMenu = ({ user, handleLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary mb-4">
      <div className="container">
        <Link className="navbar-brand" to="/home">FinanzApp</Link>
        
        <button 
          className="navbar-toggler" 
          type="button" 
          onClick={toggleMenu}
          aria-expanded={isMenuOpen ? "true" : "false"}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className={`collapse navbar-collapse ${isMenuOpen ? 'show' : ''}`}>
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link" to="/home">Resumen</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/movimientos-mensuales">Movimientos Mensuales</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/listado-ingresos">Ingresos</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/listado-gastos">Gastos</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/agregar">Agregar Transacción</Link>
            </li>
          </ul>
          
        </div>
      </div>
    </nav>
  );
};

export default NavigationMenu;