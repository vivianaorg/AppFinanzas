import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { isAuthenticated, getToken, setupAxiosInterceptors } from "./auth";
import GraficoAhorrosMensuales from "./GraficoAhorros"; // Asumiendo que tienes este componente para mostrar los ahorros

const ListadoAhorros = () => {
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [ahorros, setAhorros] = useState([]);
  const [totalAhorros, setTotalAhorros] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [ahorroSeleccionado, setAhorroSeleccionado] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);

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
        const fechaAhorro = new Date(ahorro.fecha);
        return (
          fechaAhorro.getMonth() + 1 === mes &&
          fechaAhorro.getFullYear() === anio
        );
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

  const formatearFecha = (fechaString) => {
    const fecha = new Date(fechaString);
    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

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

  const nombresMeses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const formatearCantidad = (cantidad) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(cantidad);
  };

  const abrirModal = (ahorro) => {
    setAhorroSeleccionado(ahorro);
    setMostrarModal(true);
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    setAhorroSeleccionado(null);
  };

  const [editando, setEditando] = useState(false);
  const [formAhorro, setFormAhorro] = useState({
    id: null,
    categoria_nombre: '',
    cantidad: '',
  });
  const iniciarEdicion = () => {
    setFormAhorro({
      id: ahorroSeleccionado.id,
      categoria_nombre: ahorroSeleccionado.categoria_nombre,
      cantidad: ahorroSeleccionado.cantidad,
    });
    setEditando(true);
  };

  const guardarEdicion = async () => {
    try {
      const token = getToken();
      await axios.patch(
        `http://127.0.0.1:8000/ahorros/${formAhorro.id}/`,
        {
          categoria: formAhorro.categoria_id,
          cantidad: formAhorro.cantidad
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
      setAhorroSeleccionado(null);
      obtenerAhorrosMensuales();
    } catch (error) {
      console.error("Error al guardar cambios:", error);
      alert("Hubo un error al actualizar el ahorro.");
    }
  };
  const [categorias, setCategorias] = useState([]);
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

  const handleCategoriaChange = (e) => {
    const categoriaId = e.target.value;
    const categoriaNombre = categorias.find(cat => cat.id.toString() === categoriaId)?.nombre || '';

    setFormAhorro({
      ...formAhorro,
      categoria_id: categoriaId,
      categoria_nombre: categoriaNombre
    });
  };

  return (
    <div className="container">
      <div className="row">
        {/* Menú lateral */}
        <div className="col-md-3 bg-dark text-white p-0">
          <div className="d-flex flex-column min-vh-100">
            <div className="p-4 text-center">
              <h3>Ahorros</h3>
            </div>
            <div className="nav flex-column nav-pills">
              <Link to="/home" className="nav-link text-white py-3 ps-4">Resumen</Link>
              <Link to="/movimientos-mensuales" className="nav-link text-white py-3 ps-4">Movimientos</Link>
              <Link to="/listado-ingresos" className="nav-link text-white py-3 ps-4">Ingresos</Link>
              <Link to="/listado-gastos" className="nav-link text-white py-3 ps-4">Gastos</Link>
              <Link to="/agregar" className="nav-link text-white py-3 ps-4">Agregar</Link>
            </div>
            <div className="mt-auto">
              <button
                onClick={() => window.location.href = "/login"}
                className="btn btn-danger w-100 rounded-0 py-3">
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="col-md-9 p-0">
          <div className="container-fluid p-4">
            {/* Encabezado con navegación de meses */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div className="d-flex align-items-center">
                <button
                  className="btn btn-outline-secondary me-2"
                  onClick={handleMesAnterior}>
                  ←
                </button>
                <h2 className="mb-0 text-danger">{nombresMeses[mes - 1]} {anio}</h2>
                <button
                  className="btn btn-outline-secondary ms-2"
                  onClick={handleMesSiguiente}>
                  →
                </button>
              </div>
              <div className="d-flex align-items-center">
                <div className="rounded-circle bg-danger text-white p-3">
                  <i className="bi bi-person"></i>
                </div>
              </div>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            {/* Gráfico de ahorros mensuales */}
            <div className="card mb-4">
              <div className="card-body">
                <GraficoAhorrosMensuales mes={mes} anio={anio} />
              </div>
            </div>

            <div className="row">
              {/* Listado de ahorros recientes */}
              <div className="col-md-7">
                <div className="card bg-light mb-4">
                  <div className="card-body">
                    <h3 className="card-title">Historial de Ahorros</h3>

                    {loading ? (
                      <p className="text-center my-4">Cargando ahorros...</p>
                    ) : ahorros && ahorros.length > 0 ? (
                      <div className="table-responsive">
                        <table className="table">
                          <thead>
                            <tr>
                              <th>Categoria</th>
                              <th className="text-end">Valor</th>
                            </tr>
                          </thead>
                          <tbody>
                            {ahorros.map((ahorro, index) => (
                              <tr key={index}>
                                <td>
                                  <span
                                    onClick={() => abrirModal(ahorro)}
                                    style={{ cursor: 'pointer', textDecoration: 'underline', color: '#007bff' }}
                                  >
                                    {categorias.find(cat => cat.id === ahorro.categoria)?.nombre || 'Sin categoria'}
                                  </span>
                                </td>
                                <td className="text-end">{formatearCantidad(ahorro.cantidad)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-center my-4">No hay ahorros para mostrar en este período.</p>
                    )}
                  </div>
                </div>

                {/* Total de ahorros */}
                <div className="card bg-success text-white">
                  <div className="card-body">
                    <h3 className="card-title">Total de Ahorros</h3>
                    <h2 className="card-text">{formatearCantidad(totalAhorros)}</h2>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
      {mostrarModal && ahorroSeleccionado && (
        <div
          className="modal d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Detalles del Ahorro</h5>
                <button type="button" className="btn-close" onClick={cerrarModal}></button>
              </div>
              <div className="modal-body">
                <p><strong>Categoría:</strong> {categorias.find(cat => cat.id === ahorroSeleccionado.categoria)?.nombre || 'Sin categoría'}</p>
                <p><strong>Fecha:</strong> {formatearFecha(ahorroSeleccionado.fecha)}</p>
                <p><strong>Valor:</strong> {formatearCantidad(ahorroSeleccionado.cantidad)}</p>
                {editando ? (
                  <div>
                    <div className="mb-3">
                      <label className="form-label">Categoría</label>
                      <select
                        className="form-select"
                        value={formAhorro.categoria_id}
                        onChange={handleCategoriaChange}
                      >
                        <option value="">Seleccionar categoría</option>
                        {categorias.map(categoria => (
                          <option key={categoria.id} value={categoria.id}>
                            {categoria.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Cantidad</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formAhorro.cantidad}
                        onChange={(e) => setFormAhorro({ ...formAhorro, cantidad: e.target.value })}
                      />
                    </div>
                  </div>
                ) : (
                  <>
                  </>
                )}

              </div>
              <div className="modal-footer">
                {editando ? (
                  <>
                    <button className="btn btn-success" onClick={guardarEdicion}>
                      Guardar
                    </button>
                    <button className="btn btn-secondary" onClick={() => setEditando(false)}>
                      Cancelar
                    </button>
                  </>
                ) : (
                  <button className="btn btn-primary" onClick={iniciarEdicion}>
                    Editar
                  </button>
                )}
                <button className="btn btn-secondary" onClick={() => setAhorroSeleccionado(null)}>
                  Cerrar
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ListadoAhorros;    