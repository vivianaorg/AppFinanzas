import React, { useState, useEffect } from "react";
import axios from "axios";
import { getToken } from "./auth";

const FormularioAgregarTransaccion = ({ onClose, onSave }) => {

  const [usuario, setUsuario] = useState(null);
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
  const token = localStorage.getItem("access_token");
  const usuario_id = Number(localStorage.getItem("usuario_id"));
  const [tipoTransaccion, setTipoTransaccion] = useState("Gastos");
  const [categoria, setCategoria] = useState("");
  const [importe, setImporte] = useState("");
  const [comentarios, setComentarios] = useState("");
  const [categorias, setCategorias] = useState([]);
  const [nuevaCategoria, setNuevaCategoria] = useState("");
  const [mostrarAgregarCategoria, setMostrarAgregarCategoria] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarCategorias();
    cargarUsuario();
  }, [tipoTransaccion]);

  const cargarCategorias = async () => {
    try {
      const token = getToken();
      if (!token) {
        setError("No hay sesión activa");
        return;
      }

      const response = await axios.get("http://127.0.0.1:8000/categorias/", {
        headers: { Authorization: `Bearer ${token}` },
        params: { tipo: tipoTransaccion.toLowerCase() },
      });

      setCategorias(response.data);
      if (response.data.length > 0) {
        setCategoria(response.data[0].id);
      }
    } catch (error) {
      console.error("Error al cargar categorías:", error);
      setError("Error al cargar las categorías");
    }
  };

  const cargarUsuario = async () => {
    try {
      const token = getToken();
      if (!token) {
        setError("No hay sesión activa");
        return;
      }

      const response = await axios.get("http://127.0.0.1:8000/me/", {
        headers: { Authorization: `Bearer ${token}` },
      });


      if (response.data?.id) {
        const usuarioId = Number(response.data.id);
        setUsuario(usuarioId);
        localStorage.setItem("usuario_id", usuarioId);
      } else {
        console.error("La respuesta no contiene un ID de usuario válido:", response.data);
        setError("Usuario inválido");
      }
    } catch (error) {
      console.error("Error al cargar usuario:", error.response?.data || error.message);
      setError("Error al cargar el usuario");
    }
  };

  const agregarCategoria = async () => {
    try {
      if (!nuevaCategoria) {
        setError("Por favor ingrese un nombre para la nueva categoría.");
        return;
      }

      const token = getToken();
      if (!token) {
        setError("No hay sesión activa");
        return;
      }

      const response = await axios.post(
        "http://127.0.0.1:8000/categorias/",
        { nombre: nuevaCategoria, tipo: tipoTransaccion.toLowerCase() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Nueva categoría agregada:", response.data);
      setCategorias([...categorias, response.data]); // Añadir la nueva categoría al estado
      setCategoria(response.data.id); // Establecer la nueva categoría como seleccionada
      setNuevaCategoria(""); // Limpiar el campo de nueva categoría
      setMostrarAgregarCategoria(false); // Ocultar el campo de nueva categoría
    } catch (error) {
      console.error("Error al agregar categoría:", error);
      setError("Error al agregar la nueva categoría");
    }
  };

  const guardarTransaccion = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = getToken();
      if (!token) {
        setError("No hay sesión activa");
        setLoading(false);
        return;
      }

      const importeNum = parseFloat(importe).toFixed(2);  // Convertir a string con dos decimales
      if (isNaN(importeNum) || importeNum <= 0) {
        setError("Por favor ingrese un importe válido");
        setLoading(false);
        return;
      }

      if (!categoria) {
        setError("Por favor seleccione una categoría");
        setLoading(false);
        return;
      }

      const transaccionData = {
        tipo: tipoTransaccion.toLowerCase(),
        categoria: parseInt(categoria), // Asegurar que sea número
        categoria_id: parseInt(categoria),
        importe: importeNum, // Enviarlo como string con dos decimales
        comentarios: comentarios || null, // Permitir nulo si está vacío
        fecha: fecha,
        usuario: usuario_id
      };

      //console.log("Datos enviados:", transaccionData);
      //console.log("Usuario ID obtenido:", usuario_id);

      const response = await axios.post(
        "http://127.0.0.1:8000/transacciones/",
        transaccionData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Transacción guardada:", response.data);
      if (onSave) onSave(response.data);
      if (onClose) onClose();
    } catch (error) {
      if (error.response) {
        console.log("Error en respuesta del servidor:", error.response.data);
        setError(`Error del servidor: ${JSON.stringify(error.response.data)}`);
      } else {
        console.log("Error de conexión:", error);
        setError("Error al conectar con el servidor");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-teal-500 rounded-lg text-white max-w-lg mx-auto">
      {error && <div className="bg-red-700 text-white p-2 rounded-md mb-4">{error}</div>}

      <h2 className="text-xl font-bold mb-4">Agregar Transacción</h2>

      {/* Selección de Tipo de Transacción */}
      <label className="block">Tipo de Transacción</label>
      <select
        value={tipoTransaccion}
        onChange={(e) => setTipoTransaccion(e.target.value)}
        className="block w-full text-black p-2 rounded-md mb-2"
      >
        <option value="Gastos">Gastos</option>
        <option value="Ingresos">Ingresos</option>
        <option value="Ahorros">Ahorros</option>
      </select>


      {/* Selección de Fecha */}
      <label className="block">Fecha</label>
      <input
        type="date"
        value={fecha}
        onChange={(e) => setFecha(e.target.value)}
        className="block w-full text-black p-2 rounded-md mb-2"
      />

      {/* Selección de Categoría */}
      <label className="block">Categoría</label>
      <select
        value={categoria}
        onChange={(e) => setCategoria(e.target.value)}
        className="block w-full text-black p-2 rounded-md mb-2"
      >
        {categorias.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.nombre}
          </option>
        ))}
      </select>

      {/* Opción para agregar nueva categoría */}
      <button
        onClick={() => setMostrarAgregarCategoria(true)}
        className="text-blue-500 mb-2"
      >
        ¿Agregar nueva categoría?
      </button>

      {mostrarAgregarCategoria && (
        <div>
          <input
            type="text"
            value={nuevaCategoria}
            onChange={(e) => setNuevaCategoria(e.target.value)}
            className="block w-full text-black p-2 rounded-md mb-2"
            placeholder="Nombre de la nueva categoría"
          />
          <button
            onClick={agregarCategoria}
            className="bg-green-600 text-white py-2 px-6 rounded-md"
          >
            Agregar categoría
          </button>
        </div>
      )}

      {/* Importe */}
      <label className="block">Importe</label>
      <input
        type="number"
        value={importe}
        onChange={(e) => setImporte(e.target.value)}
        className="block w-full text-black p-2 rounded-md mb-2"
        min="0"
      />

      {/* Comentarios */}
      <label className="block">Comentarios</label>
      <textarea
        value={comentarios}
        onChange={(e) => setComentarios(e.target.value)}
        className="block w-full text-black p-2 rounded-md mb-2"
      ></textarea>

      {/* Botón Guardar */}
      <button
        className="bg-green-600 text-white py-2 px-6 rounded-md w-full"
        onClick={guardarTransaccion}
        disabled={loading}
      >
        {loading ? "Guardando..." : "Guardar Transacción"}
      </button>
    </div>
  );
};

export default FormularioAgregarTransaccion;
