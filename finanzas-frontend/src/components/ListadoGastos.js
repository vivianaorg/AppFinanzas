import React, { useState, useEffect } from "react";
import axios from "axios";
import { isAuthenticated, getToken, setupAxiosInterceptors } from "./auth";
import ListadoGastos from "./react/ListadoGastos";

const ListadoGastosjs = () => {
    const [mes, setMes] = useState(new Date().getMonth() + 1);
    const [anio, setAnio] = useState(new Date().getFullYear());
    const [gastos, setGastos] = useState([]);
    const [totalGastos, setTotalGastos] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    // Estados para edición
    const [gastoSeleccionado, setGastoSeleccionado] = useState(null);
    const [mostrarModal, setMostrarModal] = useState(false);
    
    const [categorias, setCategorias] = useState([]);
    const [editando, setEditando] = useState(false);
    const [formGasto, setFormGasto] = useState({
        id: null,
        categoria_nombre: '',
        cantidad: '',
    });

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

    // Función mejorada para formatear cantidades en COP
    const formatearCantidad = (cantidad) => {
        // Convertir a número si es string
        const numeroLimpio = typeof cantidad === 'string' ? 
            parseFloat(cantidad.replace(/[^\d.-]/g, '')) : 
            parseFloat(cantidad);
        
        // Verificar que sea un número válido
        if (isNaN(numeroLimpio)) return 'COP $0';
        
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(numeroLimpio);
    };

    // Función para formatear cantidad sin el símbolo de moneda (para inputs)
    const formatearCantidadSinMoneda = (cantidad) => {
        const numeroLimpio = typeof cantidad === 'string' ? 
            parseFloat(cantidad.replace(/[^\d.-]/g, '')) : 
            parseFloat(cantidad);
        
        if (isNaN(numeroLimpio)) return '0';
        
        return new Intl.NumberFormat('es-CO', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(numeroLimpio);
    };

    // Función corregida para formatear fechas
    const formatearFecha = (fechaString) => {
        // Crear fecha tratándola como hora local (Colombia) en lugar de UTC
        // Esto evita problemas de zona horaria cuando USE_TZ = False en Django
        const fecha = new Date(fechaString + 'T00:00:00');
        return fecha.toLocaleDateString('es-CO', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    // Funciones para edición
    const abrirModal = (gasto) => {
        setGastoSeleccionado(gasto);
        setMostrarModal(true);
        setEditando(false);
    };

    const cerrarModal = () => {
        setMostrarModal(false);
        setGastoSeleccionado(null);
        setEditando(false);
        // Resetear el formulario
        setFormGasto({
            id: null,
            categoria_id: '',
            categoria_nombre: '',
            cantidad: '',
        });
    };

    const iniciarEdicion = () => {
        if (gastoSeleccionado) {
            // Buscar la categoría ID correspondiente
            const categoriaEncontrada = categorias.find(
                cat => cat.nombre === gastoSeleccionado.categoria_nombre
            );
            
            setFormGasto({
                id: gastoSeleccionado.id,
                categoria_id: categoriaEncontrada ? categoriaEncontrada.id.toString() : '',
                categoria_nombre: gastoSeleccionado.categoria_nombre,
                cantidad: gastoSeleccionado.cantidad.toString(),
            });
            setEditando(true);
        }
    };

    const guardarEdicion = async () => {
        try {
            const token = getToken();
            
            // Validar datos antes de enviar
            if (!formGasto.categoria_id || !formGasto.cantidad) {
                alert("Por favor complete todos los campos");
                return;
            }

            // Limpiar la cantidad de formato y convertir a número
            const cantidadLimpia = formGasto.cantidad.replace(/[^\d.-]/g, '');
            const cantidadNumerica = parseFloat(cantidadLimpia);
            
            if (isNaN(cantidadNumerica) || cantidadNumerica <= 0) {
                alert("Por favor ingrese una cantidad válida");
                return;
            }

            await axios.patch(
                `http://127.0.0.1:8000/gastos/${formGasto.id}/`,
                {
                    categoria: parseInt(formGasto.categoria_id),
                    cantidad: cantidadNumerica
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                }
            );
            
            alert("Gasto actualizado correctamente");
            cerrarModal();
            obtenerGastosMensuales(); // Recargar los datos
            
        } catch (error) {
            console.error("Error al guardar cambios:", error);
            if (error.response?.data) {
                console.error("Detalles del error:", error.response.data);
            }
            alert("Hubo un error al actualizar el gasto.");
        }
    };

    const handleCategoriaChange = (e) => {
        const categoriaId = e.target.value;
        const categoriaNombre = categorias.find(cat => cat.id.toString() === categoriaId)?.nombre || '';

        setFormGasto({
            ...formGasto,
            categoria_id: categoriaId,
            categoria_nombre: categoriaNombre
        });
    };

    // Función mejorada para manejar el cambio de cantidad con formato
    const handleCantidadChange = (e) => {
        let valor = e.target.value;
        
        // Remover todo excepto dígitos
        valor = valor.replace(/[^\d]/g, '');
        
        // Si está vacío, mantener vacío
        if (valor === '') {
            setFormGasto(prevForm => ({
                ...prevForm,
                cantidad: ''
            }));
            return;
        }
        
        // Convertir a número y formatear
        const numero = parseInt(valor);
        const valorFormateado = formatearCantidadSinMoneda(numero);
        
        setFormGasto(prevForm => ({
            ...prevForm,
            cantidad: valorFormateado
        }));
    };

    return (
        <ListadoGastos
            mes={mes}
            anio={anio}
            gastos={gastos}
            totalGastos={totalGastos}
            loading={loading}
            error={error}
            categorias={categorias}
            gastoSeleccionado={gastoSeleccionado}
            mostrarModal={mostrarModal}
            editando={editando}
            setEditando={setEditando}
            formGasto={formGasto}
            setFormGasto={setFormGasto}

            // handlers:
            handleMesAnterior={handleMesAnterior}
            handleMesSiguiente={handleMesSiguiente}
            abrirModal={abrirModal}
            cerrarModal={cerrarModal}
            iniciarEdicion={iniciarEdicion}
            guardarEdicion={guardarEdicion}
            handleCategoriaChange={handleCategoriaChange}
            handleCantidadChange={handleCantidadChange}

            // utils:
            nombresMeses={nombresMeses}
            formatearCantidad={formatearCantidad}
            formatearCantidadSinMoneda={formatearCantidadSinMoneda}
            formatearFecha={formatearFecha}
        />
    );
};

export default ListadoGastosjs;