import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import NavigationMenu from './NavigationMenu';
import Home from './home';
import MovimientosMensuales from './Movimientos';
import ListadoIngresos from './ListadoIngresos';
import ListadoGastos from './ListadoGastos';
import Login from './Login';
import { isAuthenticated } from './auth';

const AppLayout = () => {
  const [user, setUser] = useState(localStorage.getItem('username') || null);
  
  const handleLogin = (username) => {
    setUser(username);
    localStorage.setItem('username', username);
  };
  
  const handleLogout = () => {
    // Clear auth tokens
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('username');
    setUser(null);
  };

  return (
    <Router>
      {isAuthenticated() && <NavigationMenu user={user} handleLogout={handleLogout} />}
      <div className="container">
        <Routes>
          <Route 
            path="/login" 
            element={!isAuthenticated() ? <Login handleLogin={handleLogin} /> : <Navigate to="/" />} 
          />
          <Route 
            path="/" 
            element={isAuthenticated() ? <Home user={user} handleLogout={handleLogout} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/movimientos-mensuales" 
            element={isAuthenticated() ? <MovimientosMensuales /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/listado-ingresos" 
            element={isAuthenticated() ? <ListadoIngresos /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/listado-gastos" 
            element={isAuthenticated() ? <ListadoGastos /> : <Navigate to="/login" />} 
          />
        </Routes>
      </div>
    </Router>
  );
};

export default AppLayout;