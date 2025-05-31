import React, { useState, useEffect } from "react";
import "./FinancialDashboard.css";
import GraficoFinanciero from "../GraficoFinanciero"; // Importamos el componente de gráfico

const FinancialDashboard = ({ 
  user, 
  resumen, 
  ultimosMovimientos,
  formatearFecha
}) => {
  const fechaActual = new Date();
  const mesActual = fechaActual.getMonth() + 1; 
  const anioActual = fechaActual.getFullYear();

  return (
    <div className="financial-dashboard">
      {/* Barra superior */}
      <header className="dashboard-header">
        <div className="user-info">
          <div className="user-avatar"></div>
          <span className="user-name">{user}</span>
        </div>
      </header>

      <div className="dashboard-container">
        {/* Estructura de dos columnas principales */}
        <div className="main-layout">
          {/* Columna izquierda: Ingresos/Gastos y Gráfico */}
          <div className="left-column">
            {/* Tarjeta de Ingresos y Gastos */}
            <div className="summary-card income-expense-card">
              <div className="card-content">
                <div className="summary-item">
                  <div className="icon-container income-icon">
                    <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
                    </svg>
                  </div>
                  <div className="summary-text">
                    <div className="summary-label">Ingresos</div>
                    <div className="summary-value">$ {resumen?.total_ingresos?.toFixed(2) || "500000.00"}</div>
                  </div>
                </div>
                
                <div className="summary-item">
                  <div className="icon-container expense-icon">
                    <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
                    </svg>
                  </div>
                  <div className="summary-text">
                    <div className="summary-label">Gastos</div>
                    <div className="summary-value">$ {resumen?.total_gastos?.toFixed(2) || "400000.00"}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Gráfico Financiero debajo de la tarjeta de ingresos/gastos */}
            <div className="graph-container">
              <GraficoFinanciero 
                mesActual={mesActual} 
                anioActual={anioActual} 
              />
            </div>
          </div>

          {/* Columna derecha: Últimas transacciones */}
          <div className="right-column">
            <div className="transactions-card">
              <h2 className="card-title transactions-title">Últimas transacciones</h2>
              
              <div className="transactions-container">
                <table className="transactions-table">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Categoría</th>
                      <th className="amount-column">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ultimosMovimientos && ultimosMovimientos.length > 0 ? (
                      ultimosMovimientos.map((movimiento, index) => (
                        <tr key={index}>
                          <td>
                            {formatearFecha ? formatearFecha(movimiento.fecha) : movimiento.fecha}
                          </td>
                          <td>
                            {movimiento.categoria_nombre || movimiento.categoria?.nombre || ""}
                          </td>
                          <td className={`amount-column ${movimiento.tipo === 'ingreso' ? 'income-text' : 'expense-text'}`}>
                            ${parseFloat(movimiento.cantidad).toFixed(2)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="text-center">No hay movimientos recientes</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialDashboard;