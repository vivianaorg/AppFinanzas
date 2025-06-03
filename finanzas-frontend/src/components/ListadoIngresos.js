import React, { useState, useEffect } from "react";
import axios from "axios";
import { isAuthenticated, getToken, setupAxiosInterceptors } from "./auth";
import ListadoIngresos from "./react/ListadoIngresos";

const ListadoIngresosjs = () => {
    const [mes, setMes] = useState(new Date().getMonth() + 1);
    const [anio, setAnio] = useState(new Date().getFullYear());
    const [ingresos, setIngresos] = useState([]);
    const [totalIngresos, setTotalIngresos] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const [ingresoSeleccionado, setIngresoSeleccionado] = useState(null);
    const [mostrarModal, setMostrarModal] = useState(false);
    
    const [categorias, setCategorias] = useState([]);
    const [editando, setEditando] = useState(false);
    const [formIngreso, setFormIngreso] = useState({
        id: null,
        categoria_nombre: '',
        cantidad: '',
    });

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

    const formatearCantidad = (cantidad) => {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(cantidad);
    };
    const formatearFecha = (fechaString) => {
        const fecha = new Date(fechaString);
        return fecha.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };
    const abrirModal = (ingreso) => {
        setIngresoSeleccionado(ingreso);
        setMostrarModal(true);
    };

    const cerrarModal = () => {
        setMostrarModal(false);
        setIngresoSeleccionado(null);
    };

    
    const iniciarEdicion = () => {
        setFormIngreso({
            id: ingresoSeleccionado.id,
            categoria_nombre: ingresoSeleccionado.categoria_nombre,
            cantidad: ingresoSeleccionado.cantidad,
        });
        setEditando(true);
    };

    const guardarEdicion = async () => {
        try {
            const token = getToken();
            await axios.patch(
                `http://127.0.0.1:8000/ingresos/${formIngreso.id}/`,
                {
                    categoria: formIngreso.categoria_id,
                    cantidad: formIngreso.cantidad
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                }
            );
            alert("Ingreso actualizado correctamente")

            setEditando(false);
            setIngresoSeleccionado(null);
            obtenerIngresosMensuales();
        } catch (error) {
            console.error("Error al guardar cambios:", error);
            alert("Hubo un error al actualizar el ingreso.");
        }
    };

    const handleCategoriaChange = (e) => {
        const categoriaId = e.target.value;
        const categoriaNombre = categorias.find(cat => cat.id.toString() === categoriaId)?.nombre || '';

        setFormIngreso({
            ...formIngreso,
            categoria_id: categoriaId,
            categoria_nombre: categoriaNombre
        });
    };

    return (
        <ListadoIngresos
            mes={mes}
            anio={anio}
            ingresos={ingresos}
            totalIngresos={totalIngresos}
            loading={loading}
            error={error}
            categorias={categorias}
            ingresoSeleccionado={ingresoSeleccionado}
            mostrarModal={mostrarModal}
            editando={editando}
            setEditando={setEditando}
            formIngreso={formIngreso}

            // handlers:
            handleMesAnterior={handleMesAnterior}
            handleMesSiguiente={handleMesSiguiente}
            abrirModal={abrirModal}
            cerrarModal={cerrarModal}
            iniciarEdicion={iniciarEdicion}
            guardarEdicion={guardarEdicion}
            handleCategoriaChange={handleCategoriaChange}

            // utils:
            nombresMeses={nombresMeses}
            formatearCantidad={formatearCantidad}
            formatearFecha={formatearFecha}
        />
    );
};

export default ListadoIngresosjs;