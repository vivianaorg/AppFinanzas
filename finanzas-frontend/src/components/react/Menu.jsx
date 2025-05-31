import { useState } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import './Sidebar.css';
import { useLocation } from 'react-router-dom';

export default function Sidebar({ handleLogout }) {
  const [isOpen, setIsOpen] = useState(true);

  const location = useLocation();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const menuItems = [
    { name: 'Resumen', url: '/home' },
    { name: 'Movimientos', url: '/movimientos-mensuales' },
    { name: 'Ingresos', url: '/listado-ingresos' },
    { name: 'Gastos', url: '/listado-gastos' },
    { name: 'Ahorros', url: '/ahorros' },
    { name: 'Agregar Movimiento', url: '/agregar' }
  ];

  return (
    <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <button onClick={toggleSidebar} className="toggle-button">
        {isOpen ? <ChevronLeft /> : <ChevronRight />}
      </button>

      <nav>
        <ul className="menu-list">
          {menuItems.map((item, index) => (
            <li
              key={index}
              className={`menu-item ${location.pathname === item.url ? 'active' : ''}`}
            >
              <a href={item.url}>
                {isOpen ? item.name : item.name.charAt(0)}
              </a>
            </li>
          ))}
        </ul>

      </nav>

      <button className="logout-button" onClick={handleLogout}>
        {isOpen ? 'Cerrar sesión' : '↩️'}
      </button>
    </div>
  );
}
