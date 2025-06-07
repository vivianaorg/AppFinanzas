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

    // Función para formatear valores a notación k
    const formatearValor = (valor) => {
        if (valor >= 1000000) {
            return `${(valor / 1000000).toFixed(1)}M`;
        } else if (valor >= 1000) {
            return `${Math.round(valor / 1000)}k`;
        } else {
            return valor.toString();
        }
    };

    // Función personalizada para el eje Y
    const formatYAxis = (tickItem) => {
        return formatearValor(tickItem);
    };

    // Formato personalizado para el tooltip
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="custom-tooltip bg-white p-3 border shadow-sm rounded">
                    <p className="mb-2 font-weight-bold">{`${label}`}</p>
                    <p className="text-success mb-1">{`Ingresos: $${formatearValor(payload[0].value)}`}</p>
                    <p className="text-danger mb-1">{`Gastos: $${formatearValor(payload[1].value)}`}</p>
                    <p className="text-primary">{`Balance: $${formatearValor(payload[0].value - payload[1].value)}`}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="grafico-financiero mt-4">
            <div className="card">
                <div className="card-body">
                    <h3 className="card-title">Resumen</h3>
                    {loading && <p>Cargando datos del gráfico...</p>}
                    {error && <div className="alert alert-danger">{error}</div>}
                    
                    {datosMensuales.length > 0 && (
                        <div style={{ width: '100%', height: 400 }}>
                            <ResponsiveContainer>
                                <BarChart
                                    data={datosMensuales}
                                    margin={{ top: 0, right: 0, left: 0, bottom: 20 }}
                                    barCategoryGap="20%"
                                >
                                    <CartesianGrid 
                                        strokeDasharray="2 2" 
                                        stroke="#e0e0e0"
                                        horizontal={true}
                                        vertical={false}
                                    />
                                    <XAxis 
                                        dataKey="mes" 
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 14, fill: '#666' }}
                                    />
                                    <YAxis 
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12, fill: '#666' }}
                                        tickFormatter={formatYAxis}
                                        domain={[0, 'dataMax + 50000']}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend 
                                        wrapperStyle={{ paddingTop: '20px' }}
                                        iconType="rect"
                                    />
                                    <Bar 
                                        dataKey="ingresos" 
                                        name="Ingresos" 
                                        fill="#20c997"
                                        radius={[4, 4, 0, 0]}
                                        maxBarSize={60}
                                    />
                                    <Bar 
                                        dataKey="gastos" 
                                        name="Gastos" 
                                        fill="#dc3545"
                                        radius={[4, 4, 0, 0]}
                                        maxBarSize={60}
                                    />
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