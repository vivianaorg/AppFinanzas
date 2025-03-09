import React, { useState, useEffect } from "react";
import axios from "axios";
import { getToken, refreshToken, isAuthenticated } from "./auth";
import GraficoFinanciero from "./GraficoFinanciero";
import { Link } from "react-router-dom";

const Home = ({ user, handleLogout }) => {
    const [mes, setMes] = useState(new Date().getMonth() + 1);
    const [anio, setAnio] = useState(new Date().getFullYear());
    const [resumen, setResumen] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [ultimosMovimientos, setUltimosMovimientos] = useState([]);
    const [loadingMovimientos, setLoadingMovimientos] = useState(false);

    useEffect(() => {
        if (isAuthenticated()) {
            obtenerResumenFinanciero();
            obtenerUltimosMovimientos();
        } else {
            setError("No hay sesión activa. Por favor inicie sesión nuevamente.");
        }
    }, []);

    const obtenerResumenFinanciero = async () => {
        setLoading(true);
        setError(null);
        
        try {
            if (!isAuthenticated()) {
                setError("No hay sesión activa. Por favor inicie sesión nuevamente.");
                setLoading(false);
                return;
            }

            const token = getToken();
            const response = await axios.get(
                `http://127.0.0.1:8000/resumen-financiero/?mes=${mes}&anio=${anio}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            setResumen(response.data);
        } catch (error) {
            if (error.response && error.response.status === 401) {
                try {
                    const refreshSuccessful = await refreshToken();
                    if (refreshSuccessful) {
                        await obtenerResumenFinanciero();
                    } else {
                        setError("Su sesión ha expirado. Por favor inicie sesión nuevamente.");
                    }
                } catch {
                    setError("Error al renovar la sesión. Por favor inicie sesión nuevamente.");
                }
            } else {
                setError("Error de conexión. Verifique su conexión a internet.");
            }
        } finally {
            setLoading(false);
        }
    };

    const obtenerUltimosMovimientos = async () => {
        setLoadingMovimientos(true);
        
        try {
            if (!isAuthenticated()) {
                return;
            }

            const token = getToken();
            const response = await axios.get(
                "http://127.0.0.1:8000/ultimos-movimientos/",
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            setUltimosMovimientos(response.data.movimientos);
        } catch (error) {
            if (error.response && error.response.status === 401) {
                try {
                    const refreshSuccessful = await refreshToken();
                    if (refreshSuccessful) {
                        await obtenerUltimosMovimientos();
                    }
                } catch {
                    console.error("Error al renovar la sesión para obtener movimientos");
                }
            } else {
                console.error("Error al obtener últimos movimientos", error);
            }
        } finally {
            setLoadingMovimientos(false);
        }
    };

    const formatearFecha = (fechaString) => {
        const fecha = new Date(fechaString);
        return fecha.toLocaleDateString('es-ES', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric' 
        });
    };

    const nombresMeses = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", 
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    return (
        <div className="home-container">
            <h1>Bienvenido, {user}!</h1>
            <button onClick={handleLogout} className="btn btn-danger mb-4">Cerrar Sesión</button>
            <div className="resumen-financiero">
                <h2>Resumen Financiero</h2>
                {error && <div className="alert alert-danger">{error}</div>}
                <div className="form-group mb-3">
                    <label>
                        Selecciona el mes:
                        <select className="form-control" value={mes} onChange={(e) => setMes(Number(e.target.value))}>
                            {nombresMeses.map((nombre, index) => (
                                <option key={index + 1} value={index + 1}>{nombre}</option>
                            ))}
                        </select>
                    </label>
                </div>
                <div className="form-group mb-3">
                    <label>
                        Selecciona el año:
                        <input className="form-control" type="number" value={anio} onChange={(e) => setAnio(Number(e.target.value))} min="2000" max="2100" />
                    </label>
                </div>
                <button onClick={obtenerResumenFinanciero} className="btn btn-primary mb-4" disabled={loading}>
                    {loading ? "Cargando..." : "Ver Resumen"}
                </button>
                {resumen && (
                    <div className="resumen-detalles card">
                        <div className="card-body">
                            <h3 className="card-title">Resumen de {resumen.nombre_mes} {resumen.anio}</h3>
                            <div className="row">
                                <div className="col-md-6">
                                    <p>Mes: {resumen.nombre_mes}</p>
                                    <p>Año: {resumen.anio}</p>
                                    <p>Ingresos: ${resumen.total_ingresos.toFixed(2)}</p>
                                </div>
                                <div className="col-md-6">
                                    <p>Gastos: ${resumen.total_gastos.toFixed(2)}</p>
                                    <p>Ahorros: ${resumen.ahorros.toFixed(2)}</p>
                                    <p>Presupuesto Restante: ${resumen.presupuesto_restante.toFixed(2)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <div className="resumen-financiero">
                <h2>Ingresos y Gastos</h2>
                {error && <div className="alert alert-danger">{error}</div>}
                {resumen && (
                    <div className="resumen-detalles card">
                        <div className="card-body">
                            <h3 className="card-title">Ingresos y Gastos de {resumen.nombre_mes} {resumen.anio}</h3>
                            <div className="row">
                                <div className="col-md-6">
                                    <p>Ingresos: ${resumen.total_ingresos.toFixed(2)}</p>
                                </div>
                                <div className="col-md-6">
                                    <p>Gastos: ${resumen.total_gastos.toFixed(2)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Nueva sección para últimos movimientos */}
            <div className="ultimos-movimientos mt-4">
                <h2>Últimos Movimientos</h2>
                {loadingMovimientos ? (
                    <p>Cargando últimos movimientos...</p>
                ) : (
                    <div className="card">
                        <div className="card-body">
                            <h3 className="card-title">Últimos 10 Movimientos</h3>
                            {ultimosMovimientos.length === 0 ? (
                                <p>No hay movimientos recientes para mostrar.</p>
                            ) : (
                                <table className="table table-striped">
                                    <thead>
                                        <tr>
                                            <th>Fecha</th>
                                            <th>Categoría</th>
                                            <th>Cantidad</th>
                                            <th>Tipo</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {ultimosMovimientos.map((movimiento, index) => (
                                            <tr key={index} className={movimiento.tipo === 'ingreso' ? 'table-success' : 'table-danger'}>
                                                <td>{formatearFecha(movimiento.fecha)}</td>
                                                <td>{movimiento.categoria_nombre || movimiento.categoria.nombre}</td>                                                <td>${parseFloat(movimiento.cantidad).toFixed(2)}</td>
                                                <td>
                                                    <span className={`badge ${movimiento.tipo === 'ingreso' ? 'bg-success' : 'bg-danger'}`}>
                                                        {movimiento.tipo === 'ingreso' ? 'Ingreso' : 'Gasto'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                )}
            </div>
            {/* Nueva sección para el gráfico */}
            <GraficoFinanciero 
                mesActual={mes} 
                anioActual={anio} 
            />

            <div className="mt-4">
                <Link to="/movimientos-mensuales" className="btn btn-primary">
                Ver Movimientos Mensuales
                </Link>
            </div>

            <div className="mt-4">
                <Link to="/listado-ingresos" className="btn btn-primary">
                Ver Listado Ingresos
                </Link>
            </div>
            <div className="mt-4">
                <Link to="/listado-gastos" className="btn btn-primary">
                Ver Listado Gastos
                </Link>
            </div>
        </div>
    );
};

export default Home;