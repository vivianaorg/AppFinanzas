import React from 'react';
import { Link } from 'react-router-dom';
import GraficoAhorrosMensuales from '../GraficoAhorros'; // Ajusta la ruta si es necesario

const Ahorro = ({
  mes,
  anio,
  nombresMeses,
  handleMesAnterior,
  handleMesSiguiente,
  error,
  ahorros,
  categorias,
  loading,
  formatearCantidad,
  totalAhorros,
  abrirModal,
  mostrarModal,
  ahorroSeleccionado,
  cerrarModal,
  formatearFecha,
  editando,
  formAhorro,
  handleCategoriaChange,
  setFormAhorro,
  guardarEdicion,
  setEditando,
  iniciarEdicion,
  setAhorroSeleccionado
}) => {
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
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div className="d-flex align-items-center">
                <button className="btn btn-outline-secondary me-2" onClick={handleMesAnterior}>←</button>
                <h2 className="mb-0 text-danger">{nombresMeses[mes - 1]} {anio}</h2>
                <button className="btn btn-outline-secondary ms-2" onClick={handleMesSiguiente}>→</button>
              </div>
              <div className="d-flex align-items-center">
                <div className="rounded-circle bg-danger text-white p-3">
                  <i className="bi bi-person"></i>
                </div>
              </div>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="card mb-4">
              <div className="card-body">
                <GraficoAhorrosMensuales mes={mes} anio={anio} />
              </div>
            </div>

            <div className="row">
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
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
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

                {editando && (
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
                )}
              </div>

              <div className="modal-footer">
                {editando ? (
                  <>
                    <button className="btn btn-success" onClick={guardarEdicion}>Guardar</button>
                    <button className="btn btn-secondary" onClick={() => setEditando(false)}>Cancelar</button>
                  </>
                ) : (
                  <button className="btn btn-primary" onClick={iniciarEdicion}>Editar</button>
                )}
                <button className="btn btn-secondary" onClick={() => setAhorroSeleccionado(null)}>Cerrar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Ahorro;
