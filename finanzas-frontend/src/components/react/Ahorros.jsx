import React from 'react';
import GraficoAhorrosMensuales from '../GraficoAhorros'; // Ajusta la ruta si es necesario
import "./ListadoIngresos.css";

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
    <div className="listado-container">
      <main className="main-content">
        <header className="header">
          <div className="month-nav">
            <button onClick={handleMesAnterior}>←</button>
            <h2>
              <span className="mes-anio">
                {nombresMeses[mes - 1]} {anio}
              </span>
            </h2>
            <button onClick={handleMesSiguiente}>→</button>
          </div>
        </header>
        {/* ─────── SECCIÓN PRINCIPAL: HISTORIAL + TOTAL (IZQUIERDA) Y GRÁFICO (DERECHA) ─────── */}
        <section className="seccion-principal">
          <div className="lado-izquierdo">
            <div className="card-listado">
              <h3 className="card-title">Historial de Ahorros</h3>
              {loading ? (
                <p className="cargando-text">Cargando ahorros...</p>
              ) : ahorros.length > 0 ? (
                <div className="table-responsive">
                  <table className="table-ingresos">
                    <thead>
                      <tr>
                        <th>Categoría</th>
                        <th className="text-end">Valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ahorros.map((ahorro, index) => (
                        <tr key={index}>
                          <td>
                            <span
                              onClick={() => abrirModal(ahorro)}
                              className="link-categoria"
                            >
                              {categorias.find(cat => cat.id === ahorro.categoria)?.nombre || 'Sin categoría'}
                            </span>
                          </td>
                          <td className="text-end">{formatearCantidad(ahorro.cantidad)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="sin-datos">No hay ahorros para mostrar en este período.</p>
              )}
            </div>

            <div className="total-card">
              <h3>Total de Ahorros</h3>
              <h2>{formatearCantidad(totalAhorros)}</h2>
            </div>
          </div>

          <div className="lado-derecho">
            <h3 className="card-title">Gráfico de Ahorros</h3>
            <section className="grafico-section">
              <div className="card-grafico">
                <GraficoAhorrosMensuales mes={mes} anio={anio} />
              </div>
            </section>
          </div>
        </section>
      </main>

      {mostrarModal && ahorroSeleccionado && (
        <div className="modal-backdrop">
          <div className="modal-dialog-custom">
            <div className="modal-content-custom">
              <div className="modal-header-custom">
                <h5 className="modal-title">
                  {editando ? "Editar Ahorro" : "Detalles del Ahorro"}
                </h5>
                <button type="button" className="btn-close" onClick={cerrarModal}>
                  ✕
                </button>
              </div>
              <div className="modal-body-custom">
                {editando ? (
                  <div className="form-edit">
                    <div className="form-group">
                      <label className="form-label">
                        <i className="icon-category"></i>
                        Categoría
                      </label>
                      <select
                        className="form-control select-modern"
                        value={formAhorro.categoria_id || ''}
                        onChange={handleCategoriaChange}
                      >
                        <option value="">Seleccionar categoría</option>
                        {categorias.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">
                        <i className="icon-money"></i>
                        Nueva Cantidad
                      </label>
                      <div className="input-money">
                        <span className="currency-symbol">$</span>
                        <input
                          type="number"
                          className="form-control input-modern"
                          value={formAhorro.cantidad || ''}
                          onChange={(e) =>
                            setFormAhorro({ ...formAhorro, cantidad: e.target.value })
                          }
                          placeholder="0"
                          min="0"
                          step="1000"
                        />
                      </div>
                    </div>
                    <div className="current-values">
                      <h6>Valores Actuales:</h6>
                      <div className="value-item">
                        <span className="label">Categoría:</span>
                        <span className="value">
                          {categorias.find(cat => cat.id === ahorroSeleccionado.categoria)?.nombre || 'Sin categoría'}
                        </span>
                      </div>
                      <div className="value-item">
                        <span className="label">Cantidad:</span>
                        <span className="value">{formatearCantidad(ahorroSeleccionado.cantidad)}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="detail-view">
                    <div className="detail-item">
                      <div className="detail-icon">📂</div>
                      <div className="detail-content">
                        <span className="detail-label">Categoría</span>
                        <span className="detail-value">
                          {categorias.find(cat => cat.id === ahorroSeleccionado.categoria)?.nombre || 'Sin categoría'}
                        </span>
                      </div>
                    </div>
                    <div className="detail-item">
                      <div className="detail-icon">📅</div>
                      <div className="detail-content">
                        <span className="detail-label">Fecha</span>
                        <span className="detail-value">{formatearFecha(ahorroSeleccionado.fecha)}</span>
                      </div>
                    </div>
                    <div className="detail-item">
                      <div className="detail-icon">💰</div>
                      <div className="detail-content">
                        <span className="detail-label">Valor</span>
                        <span className="detail-value highlight">
                          {formatearCantidad(ahorroSeleccionado.cantidad)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer-custom">
                {editando ? (
                  <div className="button-group">
                    <button
                      className="btn btn-success btn-modern"
                      onClick={guardarEdicion}
                      disabled={!formAhorro.categoria_id || !formAhorro.cantidad}
                    >
                      <span className="btn-icon">💾</span>
                      Guardar Cambios
                    </button>
                    <button
                      className="btn btn-secondary btn-modern"
                      onClick={() => setEditando(false)}
                    >
                      <span className="btn-icon">❌</span>
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <div className="button-group">
                    <button
                      className="btn btn-primary btn-modern"
                      onClick={iniciarEdicion}
                    >
                      <span className="btn-icon">✏️</span>
                      Editar
                    </button>
                    <button
                      className="btn btn-secondary btn-modern"
                      onClick={cerrarModal}
                    >
                      <span className="btn-icon">🚪</span>
                      Cerrar
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

};

export default Ahorro;
