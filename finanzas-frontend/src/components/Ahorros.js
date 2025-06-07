import React, { useState, useEffect } from "react";
import axios from "axios";
import { isAuthenticated, getToken, setupAxiosInterceptors } from "./auth";
import Ahorros from "./react/Ahorros";

const ListadoAhorros = () => {
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [ahorros, setAhorros] = useState([]);
  const [totalAhorros, setTotalAhorros] = useState(0);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);
  const [ahorroSeleccionado, setAhorroSeleccionado] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);

  const [categorias, setCategorias] = useState([]);
  const [editando, setEditando] = useState(false);
  const [formAhorro, setFormAhorro] = useState({
    id: null,
    categoria_nombre: '',
    cantidad: '',
  });

  // Configurar interceptores de Axios al montar el componente
  useEffect(() => {
    setupAxiosInterceptors();
  }, []);

  useEffect(() => {
    if (isAuthenticated()) {
      obtenerAhorrosMensuales();
    } else {
      setError("No hay sesión activa. Por favor inicie sesión nuevamente.");
    }
  }, [mes, anio]);

  useEffect(() => {
    obtenerCategorias();
  }, []);

  const obtenerCategorias = async () => {
    try {
      const token = getToken();
      const res = await axios.get('http://127.0.0.1:8000/categorias/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategorias(res.data);
    } catch (err) {
      console.error("Error al obtener categorías:", err);
    }
  };

  const obtenerAhorrosMensuales = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = getToken();

      if (!token) {
        setError("No hay sesión activa. Por favor inicie sesión nuevamente.");
        setLoading(false);
        return;
      }

      const response = await axios.get("http://localhost:8000/ahorros/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Datos de ahorros (sin filtrar):", response.data);

      const datosFiltrados = response.data.filter(ahorro => {
        // Crear fecha en zona horaria de Colombia para evitar desfase
        const fechaAhorro = new Date(ahorro.fecha + 'T00:00:00-05:00');
        return (
          fechaAhorro.getMonth() + 1 === mes &&
          fechaAhorro.getFullYear() === anio
        );
      }).sort((a, b) => {
        // Ordenar por fecha más reciente primero
        const fechaA = new Date(a.fecha + 'T00:00:00-05:00');
        const fechaB = new Date(b.fecha + 'T00:00:00-05:00');
        return fechaB - fechaA; // Orden descendente (más reciente primero)
      });
      setAhorros(datosFiltrados);

      const total = datosFiltrados.reduce((acc, ahorro) => {
        const cantidad = parseFloat(ahorro.cantidad || 0);
        return acc + cantidad;
      }, 0);

      setTotalAhorros(total);
      console.log("Total de ahorros para", nombresMeses[mes - 1], anio, ":", total);

    } catch (error) {
      console.error("Error al obtener ahorros:", error);
    } finally {
      setLoading(false);
    }
  };

  const nombresMeses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

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

  const formatearFecha = (fechaString) => {
    // Crear fecha en zona horaria de Colombia para evitar desfase
    const fecha = new Date(fechaString + 'T00:00:00-05:00');
    return fecha.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatearCantidad = (cantidad) => {
    // Formatear con separadores correctos para Colombia
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(cantidad);
  };

  const abrirModal = (ahorro) => {
    setAhorroSeleccionado(ahorro);
    setMostrarModal(true);
    setEditando(false);
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    setAhorroSeleccionado(null);
    setEditando(false);
    // Resetear el formulario
    setFormAhorro({
      id: null,
      categoria_id: '',
      categoria_nombre: '',
      cantidad: '',
    });
  };

  const iniciarEdicion = () => {
    if (ahorroSeleccionado) {
      // Buscar la categoría ID correspondiente
      const categoriaEncontrada = categorias.find(
        cat => cat.nombre === ahorroSeleccionado.categoria_nombre
      );

      setFormAhorro({
        id: ahorroSeleccionado.id,
        categoria_id: categoriaEncontrada ? categoriaEncontrada.id.toString() : '',
        categoria_nombre: ahorroSeleccionado.categoria_nombre,
        cantidad: ahorroSeleccionado.cantidad.toString(),
      });
      setEditando(true);
    }
  };

  const guardarEdicion = async () => {
    try {
      const token = getToken();
      // Validar datos antes de enviar
      if (!formAhorro.categoria_id || !formAhorro.cantidad) {
        alert("Por favor complete todos los campos");
        return;
      }

      const cantidadNumerica = parseFloat(formAhorro.cantidad);
      if (isNaN(cantidadNumerica) || cantidadNumerica <= 0) {
        alert("Por favor ingrese una cantidad válida");
        return;
      }

      await axios.patch(
        `http://127.0.0.1:8000/ahorros/${formAhorro.id}/`,
        {
          categoria: parseInt(formAhorro.categoria_id),
          cantidad: formAhorro.cantidad
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );
      alert("Ahorro actualizado correctamente")
      cerrarModal();
      obtenerAhorrosMensuales();
    } catch (error) {
      console.error("Error al guardar cambios:", error);
      alert("Hubo un error al actualizar el ahorro.");
    }
  };

  const handleCategoriaChange = (e) => {
    const categoriaId = e.target.value;
    const categoriaNombre = categorias.find(cat => cat.id.toString() === categoriaId)?.nombre || '';

    setFormAhorro({
      ...formAhorro,
      categoria_id: categoriaId,
      categoria_nombre: categoriaNombre
    });
  };

  const handleCantidadChange = (e) => {
    const nuevaCantidad = e.target.value;

    setFormAhorro(prevForm => ({
      ...prevForm,
      cantidad: nuevaCantidad
    }));
  };

  return (
    <Ahorros
      mes={mes}
      anio={anio}
      nombresMeses={nombresMeses}
      handleMesAnterior={handleMesAnterior}
      handleMesSiguiente={handleMesSiguiente}
      error={error}
      ahorros={ahorros}
      categorias={categorias}
      loading={loading}
      formatearCantidad={formatearCantidad}
      totalAhorros={totalAhorros}
      abrirModal={abrirModal}
      mostrarModal={mostrarModal}
      ahorroSeleccionado={ahorroSeleccionado}
      cerrarModal={cerrarModal}
      formatearFecha={formatearFecha}
      editando={editando}
      setEditando={setEditando}
      formAhorro={formAhorro}
      setFormAhorro={setFormAhorro}
      iniciarEdicion={iniciarEdicion}
      guardarEdicion={guardarEdicion}
      handleCategoriaChange={handleCategoriaChange}
      handleCantidadChange={handleCantidadChange}
    />
  );
};

export default ListadoAhorros;    