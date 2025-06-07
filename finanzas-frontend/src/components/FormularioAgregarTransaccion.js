// FormularioAgregarTransaccion.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { getToken } from "./auth";
import FormularioAgregarTransaccionJSX from "./react/FormularioAgregarTransaccion";

const FormularioAgregarTransaccion = ({ onClose, onSave }) => {
  const [usuario, setUsuario] = useState(null);
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

  // SOLUCIÓN: Usar fecha local sin conversión a UTC
  const obtenerFechaLocal = () => {
    const hoy = new Date();
    const año = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0'); // getMonth() retorna 0-11
    const dia = String(hoy.getDate()).padStart(2, '0');
    return `${año}-${mes}-${dia}`;
  };

  const [fecha, setFecha] = useState(obtenerFechaLocal());

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
        setError("Usuario inválido");
      }
    } catch (error) {
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

      setCategorias([...categorias, response.data]);
      setCategoria(response.data.id);
      setNuevaCategoria("");
      setMostrarAgregarCategoria(false);
    } catch (error) {
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

      const importeLimpio = importe.replace(/\./g, "").replace(",", ".");
      const importeNum = parseFloat(importeLimpio).toFixed(2); // CORREGIDO: usar importeLimpio
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
        categoria: parseInt(categoria),
        categoria_id: parseInt(categoria),
        importe: importeNum,
        comentarios: comentarios || null,
        fecha: fecha, // La fecha ya está en formato correcto YYYY-MM-DD local
        usuario: usuario_id,
      };

      const response = await axios.post(
        "http://127.0.0.1:8000/transacciones/",
        transaccionData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (onSave) onSave(response.data);
      if (onClose) onClose();
    } catch (error) {
      setError("Error al guardar la transacción");
    } finally {
      setLoading(false);
    }
  };

  const formatearCOP = (valor) => {
    const numero = valor.replace(/\D/g, "");
    if (!numero) return "";
    return new Intl.NumberFormat("es-CO").format(numero);
  };

  return (
    <FormularioAgregarTransaccionJSX
      error={error}
      tipoTransaccion={tipoTransaccion}
      setTipoTransaccion={setTipoTransaccion}
      fecha={fecha}
      setFecha={setFecha}
      categorias={categorias}
      categoria={categoria}
      setCategoria={setCategoria}
      mostrarAgregarCategoria={mostrarAgregarCategoria}
      setMostrarAgregarCategoria={setMostrarAgregarCategoria}
      nuevaCategoria={nuevaCategoria}
      setNuevaCategoria={setNuevaCategoria}
      agregarCategoria={agregarCategoria}
      importe={importe}
      setImporte={setImporte}
      comentarios={comentarios}
      setComentarios={setComentarios}
      guardarTransaccion={guardarTransaccion}
      loading={loading}
    />
  );
};

export default FormularioAgregarTransaccion;