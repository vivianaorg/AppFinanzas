import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import { getToken } from './auth';

const GraficoGastosMensuales = ({ mes, anio }) => {
  const [datosGrafico, setDatosGrafico] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Obtener datos de los últimos meses
  useEffect(() => {
    // Verificar que mes y anio sean valores válidos
    if (mes && anio && !isNaN(mes) && !isNaN(anio)) {
      obtenerDatosGastos();
    } else {
      // Usar el mes y año actual si no se proporcionan valores válidos
      const fechaActual = new Date();
      const mesActual = fechaActual.getMonth() + 1; // getMonth() devuelve 0-11
      const anioActual = fechaActual.getFullYear();
      obtenerDatosGastos(mesActual, anioActual);
    }
  }, [mes, anio]);

  const obtenerDatosGastos = async (mesParam = mes, anioParam = anio) => {
    setLoading(true);
    setError(null);
    
    try {
      const token = getToken();
      
      if (!token) {
        setError("No hay sesión activa");
        setLoading(false);
        return;
      }

      // Asegurarse que los valores sean números
      const mesActual = parseInt(mesParam, 10);
      const anioActual = parseInt(anioParam, 10);

      // Validar que sean números válidos
      if (isNaN(mesActual) || isNaN(anioActual)) {
        throw new Error("Mes o año inválidos");
      }

      // Calcular los últimos 4 meses (incluyendo el actual)
      let meses = [];
      for (let i = 0; i < 4; i++) {
        let mesCalc = mesActual - i;
        let anioCalc = anioActual;
        
        if (mesCalc <= 0) {
          mesCalc += 12;
          anioCalc -= 1;
        }
        
        meses.push({ mes: mesCalc, anio: anioCalc });
      }
      
      // Log para depuración
      console.log("Consultando períodos:", meses);
      
      // Obtener datos para cada mes
      const resultados = await Promise.all(
        meses.map(async ({ mes: mesPeriodo, anio: anioPeriodo }) => {
          try {
            const response = await axios.get(
              'http://127.0.0.1:8000/gastos-mensuales/',
              {
                headers: { Authorization: `Bearer ${token}` },
                params: { mes: mesPeriodo, anio: anioPeriodo }
              }
            );
            
            return {
              mes: mesPeriodo,
              anio: anioPeriodo,
              total: response.data.total || 0
            };
          } catch (error) {
            console.error(`Error obteniendo datos para ${mesPeriodo}/${anioPeriodo}:`, error);
            return {
              mes: mesPeriodo,
              anio: anioPeriodo,
              total: 0
            };
          }
        })
      );
      
      // Formatear datos para el gráfico
      const nombresMeses = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
      ];
      
      const datosFormateados = resultados
        .sort((a, b) => {
          // Ordenar por fecha, primero el más antiguo
          if (a.anio !== b.anio) return a.anio - b.anio;
          return a.mes - b.mes;
        })
        .map(item => ({
          name: nombresMeses[item.mes - 1],
          gastos: item.total
        }));
      
      setDatosGrafico(datosFormateados);
    } catch (error) {
      console.error("Error al obtener datos para el gráfico:", error);
      setError("Error al cargar los datos del gráfico: " + (error.message || "Error desconocido"));
    } finally {
      setLoading(false);
    }
  };

  const formatearValor = (valor) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(valor);
  };

  return (
    <div className="h-100">
      <h3 className="card-title">Gastos Mensuales</h3>
      
      {loading ? (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
          <p>Cargando gráfico...</p>
        </div>
      ) : error ? (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
          <p className="text-danger">{error}</p>
        </div>
      ) : datosGrafico.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={datosGrafico}
            margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={value => `${Math.floor(value / 1000)}k`} />
            <Tooltip formatter={(value) => formatearValor(value)} />
            <Bar dataKey="gastos" fill="#F05252" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
          <p className="text-muted">No hay datos disponibles</p>
        </div>
      )}
    </div>
  );
};

export default GraficoGastosMensuales;