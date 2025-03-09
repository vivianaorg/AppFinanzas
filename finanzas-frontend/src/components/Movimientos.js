import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { isAuthenticated, getToken, refreshToken, setupAxiosInterceptors } from "./auth";

const MovimientosMensuales = ({ user }) => {
    const [mes, setMes] = useState(new Date().getMonth() + 1);
    const [anio, setAnio] = useState(new Date().getFullYear());
    const [movimientos, setMovimientos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Configurar interceptores de Axios al montar el componente
    useEffect(() => {
        setupAxiosInterceptors();
    }, []);

    useEffect(() => {
        if (isAuthenticated()) {
            obtenerMovimientosMensuales();
        } else {
            setError("No hay sesión activa. Por favor inicie sesión nuevamente.");
        }
    }, [mes, anio]); // Recargar cuando cambie el mes o año

    const obtenerMovimientosMensuales = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const token = getToken();
            
            if (!token) {
                setError("No hay sesión activa. Por favor inicie sesión nuevamente.");
                setLoading(false);
                return;
            }

            // Asegúrate de que la URL y los parámetros sean correctos
            // Verificar si el backend espera un formato específico para los parámetros
            const response = await axios.get(
                `http://127.0.0.1:8000/movimientos-mensuales/`, 
                { 
                    headers: { Authorization: `Bearer ${token}` },
                    params: { 
                        mes: mes,
                        anio: anio 
                    }
                }
            );
            
            // Verifica si la estructura de la respuesta es correcta
            if (response.data && Array.isArray(response.data.movimientos)) {
                setMovimientos(response.data.movimientos);
            } else if (Array.isArray(response.data)) {
                // Si la respuesta es un array directamente
                setMovimientos(response.data);
            } else {
                console.warn("Formato de respuesta inesperado:", response.data);
                setMovimientos([]);
            }
        } catch (error) {
            console.error("Error al obtener movimientos:", error);
            
            if (error.response) {
                // Si el servidor respondió con un código de error
                console.log("Respuesta del servidor:", error.response.data);
                
                if (error.response.status === 400) {
                    setError(`Error de solicitud: ${JSON.stringify(error.response.data)}`);
                } else if (error.response.status === 401) {
                    setError("Su sesión ha expirado. Por favor inicie sesión nuevamente.");
                } else {
                    setError(`Error del servidor: ${error.response.status}`);
                }
            } else if (error.request) {
                // Si la solicitud se hizo pero no se recibió respuesta
                setError("No se recibió respuesta del servidor. Verifique su conexión.");
            } else {
                // Errores en la configuración de la solicitud
                setError(`Error de configuración: ${error.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    // El resto del componente permanece igual
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

    const getRowClass = (tipo) => {
        switch(tipo) {
            case 'ingreso':
                return 'table-success';
            case 'gasto':
                return 'table-danger';
            case 'ahorro':
                return 'table-info';
            default:
                return '';
        }
    };

    const getBadgeInfo = (tipo) => {
        switch(tipo) {
            case 'ingreso':
                return { text: 'Ingreso', class: 'bg-success' };
            case 'gasto':
                return { text: 'Gasto', class: 'bg-danger' };
            case 'ahorro':
                return { text: 'Ahorro', class: 'bg-info' };
            default:
                return { text: 'Desconocido', class: 'bg-secondary' };
        }
    };

    return (
        <div className="home-container">
            <h1>Movimientos Mensuales</h1>
            <div className="mb-3">
                <Link to="/home" className="btn btn-secondary mr-2">
                    Volver al Inicio
                </Link>
            </div>
            {error && <div className="alert alert-danger">{error}</div>}
            
            <div className="row mb-3">
                <div className="col-md-6">
                    <div className="form-group">
                        <label>
                            Selecciona el mes:
                            <select 
                                className="form-control" 
                                value={mes} 
                                onChange={(e) => setMes(Number(e.target.value))}
                            >
                                {nombresMeses.map((nombre, index) => (
                                    <option key={index + 1} value={index + 1}>{nombre}</option>
                                ))}
                            </select>
                        </label>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="form-group">
                        <label>
                            Selecciona el año:
                            <input 
                                className="form-control" 
                                type="number" 
                                value={anio} 
                                onChange={(e) => setAnio(Number(e.target.value))} 
                                min="2000" 
                                max="2100" 
                            />
                        </label>
                    </div>
                </div>
            </div>
            
            <button 
                onClick={obtenerMovimientosMensuales} 
                className="btn btn-primary mb-4" 
                disabled={loading}
            >
                {loading ? "Cargando..." : "Actualizar"}
            </button>

            <div className="card">
                <div className="card-body">
                    <h3 className="card-title">Movimientos de {nombresMeses[mes-1]} {anio}</h3>
                    
                    {loading ? (
                        <p>Cargando movimientos...</p>
                    ) : movimientos && movimientos.length > 0 ? (
                        <div className="table-responsive">
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
                                    {movimientos.map((movimiento, index) => {
                                        const badgeInfo = getBadgeInfo(movimiento.tipo);
                                        return (
                                            <tr key={index} className={getRowClass(movimiento.tipo)}>
                                                <td>{formatearFecha(movimiento.fecha)}</td>
                                                <td>{movimiento.categoria_nombre || 'Sin categoría'}</td>
                                                <td>${parseFloat(movimiento.cantidad).toFixed(2)}</td>
                                                <td>
                                                    <span className={`badge ${badgeInfo.class}`}>
                                                        {badgeInfo.text}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p>No hay movimientos para mostrar en este período.</p>
                    )}
                </div>
            </div>
            
            <div className="mt-4">
                <div className="d-flex justify-content-center">
                    <div className="badge bg-success mx-2 p-2">Ingresos</div>
                    <div className="badge bg-danger mx-2 p-2">Gastos</div>
                    <div className="badge bg-info mx-2 p-2">Ahorros</div>
                </div>
            </div>
        </div>
    );
};

export default MovimientosMensuales;