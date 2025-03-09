import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { isAuthenticated, getToken, setupAxiosInterceptors } from "./auth";
import GraficoIngresosMensuales from "./GraficoIngresos";

const ListadoIngresos = () => {
    const [mes, setMes] = useState(new Date().getMonth() + 1);
    const [anio, setAnio] = useState(new Date().getFullYear());
    const [ingresos, setIngresos] = useState([]);
    const [totalIngresos, setTotalIngresos] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Configurar interceptores de Axios al montar el componente
    useEffect(() => {
        setupAxiosInterceptors();
    }, []);

    useEffect(() => {
        if (isAuthenticated()) {
            obtenerIngresosMensuales();
        } else {
            setError("No hay sesión activa. Por favor inicie sesión nuevamente.");
        }
    }, [mes, anio]); // Recargar cuando cambie el mes o año

    const obtenerIngresosMensuales = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const token = getToken();
            
            if (!token) {
                setError("No hay sesión activa. Por favor inicie sesión nuevamente.");
                setLoading(false);
                return;
            }

            // Obtener ingresos del mes seleccionado
            const response = await axios.get(
                `http://127.0.0.1:8000/ingresos-mensuales/`, 
                { 
                    headers: { Authorization: `Bearer ${token}` },
                    params: { 
                        mes: mes,
                        anio: anio 
                    }
                }
            );
            
            // Procesar respuesta
            if (response.data && Array.isArray(response.data.ingresos)) {
                setIngresos(response.data.ingresos);
                setTotalIngresos(response.data.total || 0);
            } else {
                console.warn("Formato de respuesta inesperado:", response.data);
                setIngresos([]);
                setTotalIngresos(0);
            }
        } catch (error) {
            console.error("Error al obtener ingresos:", error);
            
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
                            <h3>Ingresos</h3>
                        </div>
                        <div className="nav flex-column nav-pills">
                            <Link to="/home" className="nav-link text-white py-3 ps-4">Resumen</Link>
                            <Link to="/movimientos-mensuales" className="nav-link text-white py-3 ps-4">Movimientos</Link>
                            <Link to="/listado-ingresos" className="nav-link text-white active py-3 ps-4">Ingresos</Link>
                            <Link to="/listado-gastos" className="nav-link text-white py-3 ps-4">Gastos</Link>
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
                        
                        {/* Gráfico de ingresos mensuales */}
                        <div className="card mb-4">
                            <div className="card-body">
                                <GraficoIngresosMensuales mes={mes} anio={anio} />
                            </div>
                        </div>
                        
                        <div className="row">
                            {/* Listado de ingresos recientes */}
                            <div className="col-md-7">
                                <div className="card bg-light mb-4">
                                    <div className="card-body">
                                        <h3 className="card-title">Historial de Ingresos</h3>
                                        
                                        {loading ? (
                                            <p className="text-center my-4">Cargando ingresos...</p>
                                        ) : ingresos && ingresos.length > 0 ? (
                                            <div className="table-responsive">
                                                <table className="table">
                                                    <thead>
                                                        <tr>
                                                            <th>Categoría</th>
                                                            <th className="text-end">Valor</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {ingresos.map((ingreso, index) => (
                                                            <tr key={index}>
                                                                <td>{ingreso.categoria_nombre || 'Sin categoría'}</td>
                                                                <td className="text-end">{formatearCantidad(ingreso.cantidad)}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <p className="text-center my-4">No hay ingresos para mostrar en este período.</p>
                                        )}
                                    </div>
                                </div>
                                
                                {/* Total de ingresos */}
                                <div className="card bg-success text-white">
                                    <div className="card-body">
                                        <h3 className="card-title">Total de Ingresos</h3>
                                        <h2 className="card-text">{formatearCantidad(totalIngresos)}</h2>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Distribución de ingresos por categoría */}
                            <div className="col-md-5">
                                <div className="card h-100">
                                    <div className="card-body">
                                        <h3 className="card-title">Distribución por Categoría</h3>
                                        {loading ? (
                                            <div className="d-flex justify-content-center align-items-center h-75">
                                                <p>Cargando datos...</p>
                                            </div>
                                        ) : ingresos && ingresos.length > 0 ? (
                                            <div className="mt-3">
                                                {ingresos.map((ingreso, index) => {
                                                    const porcentaje = (ingreso.cantidad / totalIngresos) * 100;
                                                    return (
                                                        <div key={index} className="mb-3">
                                                            <div className="d-flex justify-content-between mb-1">
                                                                <span>{ingreso.categoria_nombre || 'Sin categoría'}</span>
                                                                <span>{formatearCantidad(ingreso.cantidad)} ({porcentaje.toFixed(1)}%)</span>
                                                            </div>
                                                            <div className="progress" style={{ height: '10px' }}>
                                                                <div 
                                                                    className="progress-bar bg-success" 
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

export default ListadoIngresos;