import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getToken } from './auth';

const CategoriasUsuario = () => {
    const [categorias, setCategorias] = useState([]);
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const obtenerCategorias = async () => {
            try {
                const token = getToken();
                const res = await axios.get('http://127.0.0.1:8000/categorias/', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setCategorias(res.data);
            } catch (err) {
                if (err.response && err.response.status === 401) {
                    alert("No estás logeado o tu sesión ha expirado.");
                } else {
                    alert("Error al obtener las categorías");
                }
                setError("Error al obtener las categorías");
            }
        };

        obtenerCategorias();
    }, []);

    useEffect(() => {
        const obtenerCategoria = async () => {
            if (!categoriaSeleccionada) return;

            try {
                const token = getToken();
                const res = await axios.get(`http://127.0.0.1:8000/categorias/${categoriaSeleccionada}/`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setNombre(res.data.nombre);
                setDescripcion(res.data.description || '');
            } catch (error) {
                setMensaje("Error al cargar la categoría");
            }
        };

        obtenerCategoria();
    }, [categoriaSeleccionada]);

    // Guardar cambios
    const handleGuardar = async () => {
        try {
            const token = getToken();
            await axios.patch(`http://127.0.0.1:8000/categorias/${categoriaSeleccionada}/`, {
                nombre,
                description: descripcion
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Categoría actualizada correctamente");

            // Refrescar la lista de categorías
            const res = await axios.get('http://127.0.0.1:8000/categorias/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCategorias(res.data);
            setCategoriaSeleccionada(null);
        } catch (error) {
            setMensaje("Error al guardar los cambios");
        }
    };

    return (
        <div>
            <h2>Categorías del Usuario</h2>
            {error && <p>{error}</p>}

            <ul>
                {categorias.map(categoria => (
                    <li key={categoria.id}>
                        {categoria.nombre} - {categoria.description}
                        <button onClick={() => setCategoriaSeleccionada(categoria.id)}>
                            Editar
                        </button>
                    </li>
                ))}
            </ul>

            {categoriaSeleccionada && (
                <div style={{ marginTop: '20px' }}>
                    <h3>Editar Categoría</h3>
                    <input
                        value={nombre}
                        onChange={e => setNombre(e.target.value)}
                        placeholder="Nombre"
                    />
                    <input
                        value={descripcion}
                        onChange={e => setDescripcion(e.target.value)}
                        placeholder="Descripción"
                    />
                    <button onClick={handleGuardar}>Guardar</button>
                    <button onClick={() => setCategoriaSeleccionada(null)} style={{ marginLeft: '10px' }}>
                        Cancelar
                    </button>
                    {mensaje && <p>{mensaje}</p>}
                </div>
            )}
        </div>
    );
};

export default CategoriasUsuario;
