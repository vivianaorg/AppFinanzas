import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import { getToken } from './auth';

const GraficoAhorrosMensuales = ({ mes, anio }) => {
  const [datosGrafico, setDatosGrafico] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Obtener datos de los últimos meses
  useEffect(() => {
    obtenerDatosAhorros();
  }, [mes, anio]);

  const obtenerDatosAhorros = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = getToken();

      if (!token) {
        setError("No hay sesión activa");
        setLoading(false);
        return;
      }

      // Obtener todos los ahorros una sola vez
      const response = await axios.get(
        'http://127.0.0.1:8000/ahorros/',
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Calcular los últimos 4 meses (incluyendo el actual)
      let mesesData = [];
      for (let i = 0; i < 4; i++) {
        let mesCalc = mes - i;
        let anioCalc = anio;

        if (mesCalc <= 0) {
          mesCalc += 12;
          anioCalc -= 1;
        }

        // Filtrar ahorros para este mes y año
        const ahorrosDelMes = response.data.filter(ahorro => {
          const fechaAhorro = new Date(ahorro.fecha);
          return (
            fechaAhorro.getMonth() + 1 === mesCalc &&
            fechaAhorro.getFullYear() === anioCalc
          );
        });

        // Calcular el total para este mes
        const totalMes = ahorrosDelMes.reduce(
          (sum, ahorro) => sum + parseFloat(ahorro.cantidad), 0
        );

        mesesData.push({
          mes: mesCalc,
          anio: anioCalc,
          total: totalMes
        });
      }

      // Formatear datos para el gráfico
      const nombresMeses = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
      ];

      const datosFormateados = mesesData
        .sort((a, b) => {
          // Ordenar por fecha, primero el más antiguo
          if (a.anio !== b.anio) return a.anio - b.anio;
          return a.mes - b.mes;
        })
        .map(item => ({
          name: nombresMeses[item.mes - 1],
          ahorros: item.total
        }));

      setDatosGrafico(datosFormateados);
      console.log("datos grafico", datosFormateados);
    } catch (error) {
      console.error("Error al obtener datos para el gráfico:", error);
      setError("Error al cargar los datos del gráfico");
    } finally {
      setLoading(false);
    }
  };

  const formatearValor = (valor) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(valor);
  };

  return (
    <div className="h-100">
      <h3 className="card-title">Ahorros Mensuales</h3>

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
            <Bar dataKey="ahorros" fill="#28A745" radius={[4, 4, 0, 0]} />
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

export default GraficoAhorrosMensuales;
