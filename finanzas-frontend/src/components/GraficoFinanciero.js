import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import axios from "axios";
import { getToken, refreshToken, isAuthenticated } from "./auth";

const GraficoFinanciero = ({ mesActual, anioActual }) => {
    const [datosMensuales, setDatosMensuales] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isAuthenticated()) {
            obtenerDatosMensuales();
        }
    }, [mesActual, anioActual]);

    const obtenerDatosMensuales = async () => {
        setLoading(true);
        setError(null);
        
        try {
            if (!isAuthenticated()) {
                setError("No hay sesión activa");
                setLoading(false);
                return;
            }

            const token = getToken();
            
            // Obtener datos para los 4 meses anteriores incluyendo el mes actual
            const datos = [];
            const mesesAConsultar = 4;
            
            for (let i = 0; i < mesesAConsultar; i++) {
                // Calcular el mes y año para esta iteración
                let mesConsulta = mesActual - i;
                let anioConsulta = anioActual;
                
                // Ajustar si el mes es negativo (ir al año anterior)
                if (mesConsulta <= 0) {
                    mesConsulta = 12 + mesConsulta;
                    anioConsulta = anioActual - 1;
                }
                
                try {
                    const response = await axios.get(
                        `http://127.0.0.1:8000/resumen-financiero/?mes=${mesConsulta}&anio=${anioConsulta}`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    
                    // Añadir los datos al array
                    datos.push({
                        mes: response.data.nombre_mes,
                        ingresos: response.data.total_ingresos,
                        gastos: response.data.total_gastos,
                        presupuesto_restante: response.data.presupuesto_restante
                    });
                } catch (err) {
                    console.error(`Error al obtener datos para ${mesConsulta}/${anioConsulta}`, err);
                }
            }
            
            // Invertir el array para que los meses aparezcan en orden cronológico
            setDatosMensuales(datos.reverse());
            
        } catch (error) {
            if (error.response && error.response.status === 401) {
                try {
                    const refreshSuccessful = await refreshToken();
                    if (refreshSuccessful) {
                        await obtenerDatosMensuales();
                    } else {
                        setError("Su sesión ha expirado");
                    }
                } catch {
                    setError("Error al renovar la sesión");
                }
            } else {
                setError("Error de conexión");
            }
        } finally {
            setLoading(false);
        }
    };

    // Formato personalizado para el tooltip
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="custom-tooltip bg-white p-3 border shadow-sm rounded">
                    <p className="mb-2 font-weight-bold">{`${label}`}</p>
                    <p className="text-success mb-1">{`Ingresos: $${payload[0].value.toFixed(2)}`}</p>
                    <p className="text-danger mb-1">{`Gastos: $${payload[1].value.toFixed(2)}`}</p>
                    <p className="text-primary">{`Balance: $${(payload[0].value - payload[1].value).toFixed(2)}`}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="grafico-financiero mt-4">
            <div className="card">
                <div className="card-body">
                    <h3 className="card-title">Evolución Financiera</h3>
                    {loading && <p>Cargando datos del gráfico...</p>}
                    {error && <div className="alert alert-danger">{error}</div>}
                    
                    {datosMensuales.length > 0 && (
                        <div style={{ width: '100%', height: 350 }}>
                            <ResponsiveContainer>
                                <BarChart
                                    data={datosMensuales}
                                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="mes" />
                                    <YAxis />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                    <Bar dataKey="ingresos" name="Ingresos" fill="#20c997" />
                                    <Bar dataKey="gastos" name="Gastos" fill="#ff5858" />
                                    <YAxis domain={[0, 'dataMax']} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                    
                    {datosMensuales.length === 0 && !loading && (
                        <p>No hay datos suficientes para mostrar el gráfico.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GraficoFinanciero;