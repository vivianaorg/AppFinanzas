import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { isAuthenticated, getToken, setupAxiosInterceptors } from "./auth";
import GraficoGastosMensuales from "./GraficoGastos";

const ListadoGastos = () => {
    const [mes, setMes] = useState(new Date().getMonth() + 1);
    const [anio, setAnio] = useState(new Date().getFullYear());
    const [gastos, setGastos] = useState([]);
    const [totalGastos, setTotalGastos] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Configurar interceptores de Axios al montar el componente
    useEffect(() => {
        setupAxiosInterceptors();
    }, []);

    useEffect(() => {
        if (isAuthenticated()) {
            obtenerGastosMensuales();
        } else {
            setError("No hay sesión activa. Por favor inicie sesión nuevamente.");
        }
    }, [mes, anio]); // Recargar cuando cambie el mes o año

    const obtenerGastosMensuales = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const token = getToken();
            
            if (!token) {
                setError("No hay sesión activa. Por favor inicie sesión nuevamente.");
                setLoading(false);
                return;
            }

            // Obtener gastos del mes seleccionado
            const response = await axios.get(
                `http://127.0.0.1:8000/gastos-mensuales/`, 
                { 
                    headers: { Authorization: `Bearer ${token}` },
                    params: { 
                        mes: mes,
                        anio: anio 
                    }
                }
            );
            
            // Procesar respuesta
            if (response.data && Array.isArray(response.data.gastos)) {
                setGastos(response.data.gastos);
                setTotalGastos(response.data.total || 0);
            } else {
                console.warn("Formato de respuesta inesperado:", response.data);
                setGastos([]);
                setTotalGastos(0);
            }
        } catch (error) {
            console.error("Error al obtener gastos:", error);
            
            if (error.response) {
                console.log("Respuesta del servidor:", error.response.data);
                
                if (error.response.status === 400) {
                    setError(`Error de solicitud: ${JSON.stringify(error.response.data)}`);
                } else if (error.response.status === 401) {
                    setError("Su sesión ha expirado. Por favor inicie sesión nuevamente.");
                } else {
                    setError(`Error del servidor: ${error.response.status}`);
                }
            } else if (error.request) {
                setError("No se recibió respuesta del servidor. Verifique su conexión.");
            } else {
                setError(`Error de configuración: ${error.message}`);
            }
        } finally {
            setLoading(false);
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

    const handleMesAnterior = () => {
        if (mes === 1) {
            setMes(12);
            setAnio(anio - 1);
        } else {
            setMes(mes - 1);
        }
    };

    const handleMesSiguiente = () => {
        if (mes === 12) {
            setMes(1);
            setAnio(anio + 1);
        } else {
            setMes(mes + 1);
        }
    };

    const nombresMeses = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", 
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    const formatearCantidad = (cantidad) => {
        return new Intl.NumberFormat('es-ES', { 
            style: 'currency', 
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(cantidad);
    };

    return (
        <div className="container">
            <div className="row">
                {/* Menú lateral */}
                <div className="col-md-3 bg-dark text-white p-0">
                    <div className="d-flex flex-column min-vh-100">
                        <div className="p-4 text-center">
                            <h3>Gastos</h3>
                        </div>
                        <div className="nav flex-column nav-pills">
                            <Link to="/home" className="nav-link text-white py-3 ps-4">Resumen</Link>
                            <Link to="/movimientos-mensuales" className="nav-link text-white py-3 ps-4">Movimientos</Link>
                            <Link to="/listado-ingresos" className="nav-link text-white py-3 ps-4">Ingresos</Link>
                            <Link to="/listado-gastos" className="nav-link text-white active py-3 ps-4">Gastos</Link>
                            <Link to="/agregar" className="nav-link text-white py-3 ps-4">Agregar</Link>
                        </div>
                        <div className="mt-auto">
                            <button 
                                onClick={() => window.location.href = "/login"} 
                                className="btn btn-danger w-100 rounded-0 py-3">
                                Cerrar sesión
                            </button>
                        </div>
                    </div>
                </div>
                
                {/* Contenido principal */}
                <div className="col-md-9 p-0">
                    <div className="container-fluid p-4">
                        {/* Encabezado con navegación de meses */}
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <div className="d-flex align-items-center">
                                <button 
                                    className="btn btn-outline-secondary me-2" 
                                    onClick={handleMesAnterior}>
                                    ←
                                </button>
                                <h2 className="mb-0 text-danger">{nombresMeses[mes-1]} {anio}</h2>
                                <button 
                                    className="btn btn-outline-secondary ms-2" 
                                    onClick={handleMesSiguiente}>
                                    →
                                </button>
                            </div>
                            <div className="d-flex align-items-center">
                                <div className="rounded-circle bg-danger text-white p-3">
                                    <i className="bi bi-person"></i>
                                </div>
                            </div>
                        </div>

                        {error && <div className="alert alert-danger">{error}</div>}
                        
                        {/* Gráfico de gastos por categoría */}
                        <div className="card mb-4">
                            <div className="card-body">
                                <GraficoGastosMensuales 
                                    gastos={gastos} 
                                    totalGastos={totalGastos} 
                                    loading={loading} 
                                />
                            </div>
                        </div>
                        
                        <div className="row">
                            {/* Listado de gastos recientes */}
                            <div className="col-md-7">
                                <div className="card bg-light mb-4">
                                    <div className="card-body">
                                        <h3 className="card-title">Historial de Gastos</h3>
                                        
                                        {loading ? (
                                            <p className="text-center my-4">Cargando gastos...</p>
                                        ) : gastos && gastos.length > 0 ? (
                                            <div className="table-responsive">
                                                <table className="table">
                                                    <thead>
                                                        <tr>
                                                            <th>Categoría</th>
                                                            <th className="text-end">Valor</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {gastos.map((gasto, index) => (
                                                            <tr key={index}>
                                                                <td>{gasto.categoria_nombre || 'Sin categoría'}</td>
                                                                <td className="text-end">{formatearCantidad(gasto.cantidad)}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <p className="text-center my-4">No hay gastos para mostrar en este período.</p>
                                        )}
                                    </div>
                                </div>
                                
                                {/* Total de gastos */}
                                <div className="card bg-danger text-white">
                                    <div className="card-body">
                                        <h3 className="card-title">Total de Gastos</h3>
                                        <h2 className="card-text">{formatearCantidad(totalGastos)}</h2>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Distribución de gastos por categoría */}
                            <div className="col-md-5">
                                <div className="card h-100">
                                    <div className="card-body">
                                        <h3 className="card-title">Distribución por Categoría</h3>
                                        {loading ? (
                                            <div className="d-flex justify-content-center align-items-center h-75">
                                                <p>Cargando datos...</p>
                                            </div>
                                        ) : gastos && gastos.length > 0 ? (
                                            <div className="mt-3">
                                                {gastos.map((gasto, index) => {
                                                    const porcentaje = (gasto.cantidad / totalGastos) * 100;
                                                    return (
                                                        <div key={index} className="mb-3">
                                                            <div className="d-flex justify-content-between mb-1">
                                                                <span>{gasto.categoria_nombre || 'Sin categoría'}</span>
                                                                <span>{formatearCantidad(gasto.cantidad)} ({porcentaje.toFixed(1)}%)</span>
                                                            </div>
                                                            <div className="progress" style={{ height: '10px' }}>
                                                                <div 
                                                                    className="progress-bar bg-danger" 
                                                                    role="progressbar" 
                                                                    style={{ width: `${porcentaje}%` }}
                                                                    aria-valuenow={porcentaje} 
                                                                    aria-valuemin="0" 
                                                                    aria-valuemax="100">
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="d-flex justify-content-center align-items-center h-75">
                                                <p className="text-muted">No hay datos para mostrar</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ListadoGastos;