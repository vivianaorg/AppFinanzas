import React, { useState, useEffect } from "react";
import axios from "axios";
import { getToken, refreshToken, isAuthenticated } from "./auth";
import FinancialDashboard from './react/home';

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

    const nombresMeses = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    const formatearFecha = (fechaString) => {
    // Crear fecha en zona horaria de Colombia para evitar desfase
    const fecha = new Date(fechaString + 'T00:00:00-05:00');
    return fecha.toLocaleDateString('es-CO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};

// Agregar función para formatear cantidades
const formatearCantidad = (cantidad) => {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(cantidad);
};

    return (
            <FinancialDashboard 
                user={user}
                resumen={resumen}
                ultimosMovimientos={ultimosMovimientos}
                formatearFecha={formatearFecha}
                formatearCantidad={formatearCantidad}
            />  
            );
};

            export default Home;