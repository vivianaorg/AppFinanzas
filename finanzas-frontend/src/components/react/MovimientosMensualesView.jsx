import React from "react";
import { Link } from "react-router-dom";
import SelectMesAnio from "./SelectMesAnio";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from "@mui/material";
import './MovimientosMensuales.css';

const MovimientosMensualesView = ({
  mes,
  anio,
  nombresMeses,
  error,
  loading,
  movimientos,
  setMes,
  setAnio,
  obtenerMovimientosMensuales,
  formatearFecha,
  getRowClass,
  getBadgeInfo
}) => {
  const getBackgroundClass = (tipo) => {
    switch (tipo) {
      case 'ingreso':
        return 'fondo-ingreso'; // Fondo suave verde
      case 'ahorro':
        return 'fondo-ahorro'; // Fondo suave azul
      case 'gasto':
        return 'fondo-gasto'; // Fondo suave rojo
      default:
        return '';
    }
  };

  return (
    <div className="movimientos-container">
      <h1 className="titulo-principal">Movimientos Mensuales</h1>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="filtros">
        <div className="form-group">
          <SelectMesAnio tipo="mes" valor={mes} setValor={setMes} />
        </div>

        <div className="form-group">
          <SelectMesAnio tipo="anio" valor={anio} setValor={setAnio} />
        </div>
      </div>

      <div className="principal">
      <div className="card">
        <div className="card-body">
          <h3 className="card-title">
            {nombresMeses[mes - 1]} {anio}
          </h3>

          {loading ? (
            <p>Cargando movimientos...</p>
          ) : movimientos && movimientos.length > 0 ? (
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }} aria-label="tabla de movimientos">
                <TableHead>
                  <TableRow>
                    <TableCell>Fecha</TableCell>
                    <TableCell>Categoría</TableCell>
                    <TableCell align="right">Cantidad</TableCell>
                    <TableCell>Tipo</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {movimientos.map((movimiento, index) => {
                    const badgeInfo = getBadgeInfo(movimiento.tipo);
                    return (
                      <TableRow
                        key={index}
                        className={`${getRowClass(movimiento.tipo)} ${getBackgroundClass(movimiento.tipo)}`}
                      >
                        <TableCell>{formatearFecha(movimiento.fecha)}</TableCell>
                        <TableCell>{movimiento.categoria_nombre || 'Sin categoría'}</TableCell>
                        <TableCell align="right">${parseFloat(movimiento.cantidad).toFixed(2)}</TableCell>
                        <TableCell>
                          <span className={`badge ${badgeInfo.class}`}>
                            {badgeInfo.text}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <p>No hay movimientos para mostrar en este período.</p>
          )}
        </div>
      </div>

      <div className="leyenda-tipos">
        <div className="badge bg-success">Ingresos</div>
        <div className="badge bg-danger">Gastos</div>
        <div className="badge bg-info">Ahorros</div>
      </div>
    </div>
    </div>
  );
};

export default MovimientosMensualesView;
