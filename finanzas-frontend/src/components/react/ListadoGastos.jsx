import React from 'react';
import GraficoGastosMensuales from '../GraficoGastos'; // Ajusta si está en otra carpeta
import "./ListadoIngresos.css";

const ListadoGastos = ({
    mes,
    anio,
    nombresMeses,
    gastos,
    totalGastos,
    loading,
    error,
    handleMesAnterior,
    handleMesSiguiente,
    abrirModal,
    formatearCantidad,
    mostrarModal,
    gastoSeleccionado,
    cerrarModal,
    formatearFecha,
    editando,
    setEditando,
    formGasto,
    setFormIngreso,
    handleCategoriaChange,
    handleCantidadChange,
    guardarEdicion,
    iniciarEdicion,
    categorias,
    setGastoSeleccionado,
}) => {
    return (
        <div className="listado-container">
            {/* ─────── MAIN CONTENT ─────── */}
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

                {error && <div className="alert-error">{error}</div>}

                {/* ─────── SECCIÓN PRINCIPAL: HISTORIAL + TOTAL (IZQUIERDA) Y GRÁFICO (DERECHA) ─────── */}
                <section className="seccion-principal">
                    {/* LADO IZQUIERDO: Historial y Total */}
                    <div className="lado-izquierdo">
                        <div className="contenido-cards">
                            {/* Historial de Ingresos */}
                            <div className="card-listado">
                                <h3 className="card-title">Historial de Gastos</h3>
                                {loading ? (
                                    <p className="cargando-text">Cargando gastos...</p>
                                ) : gastos.length > 0 ? (
                                    <div className="table-responsive">
                                        <table className="table-ingresos">
                                            <thead>
                                                <tr>
                                                    <th>Categoría</th>
                                                    <th className="text-end">Valor</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {gastos.map((gasto, index) => (
                                                    <tr key={index}>
                                                        <td>
                                                            <span
                                                                onClick={() => abrirModal(gasto)}
                                                                className="link-categoria"
                                                            >
                                                                {gasto.categoria_nombre || "Sin categoría"}
                                                            </span>
                                                        </td>
                                                        <td className="text-end">
                                                            {formatearCantidad(gasto.cantidad)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="sin-datos">
                                        No hay gastos para mostrar en este período.
                                    </p>
                                )}
                            </div>

                            {/* Total de Ingresos */}
                            <div className="total-card">
                                <h3>Total de Gastos</h3>
                                <h2>{formatearCantidad(totalGastos)}</h2>
                            </div>
                        </div>
                    </div>

                    {/* LADO DERECHO: Gráfico de Ingresos */}
                    <div className="lado-derecho">
                        <h3 className="card-title">Gráfico de Gastos</h3>
                        <section className="grafico-section">
                            <div className="card-grafico">
                                <GraficoGastosMensuales mes={mes} anio={anio} />
                            </div>
                        </section>
                    </div>
                </section>
            </main>

            {/* ─────── MODAL DETALLE DE INGRESO ─────── */}
            {mostrarModal && gastoSeleccionado && (
                <div className="modal-backdrop">
                    <div className="modal-dialog-custom">
                        <div className="modal-content-custom">
                            <div className="modal-header-custom">
                                <h5 className="modal-title">
                                    {editando ? "Editar Gasto" : "Detalles del Gasto"}
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={cerrarModal}
                                >
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
                                                value={formGasto.categoria_id || ''}
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
                                                    value={formGasto.cantidad || ''}
                                                    onChange={handleCantidadChange}
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
                                                <span className="value">{gastoSeleccionado.categoria_nombre || "Sin categoría"}</span>
                                            </div>
                                            <div className="value-item">
                                                <span className="label">Cantidad:</span>
                                                <span className="value">{formatearCantidad(gastoSeleccionado.cantidad)}</span>
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
                                                    {gastoSeleccionado.categoria_nombre || "Sin categoría"}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <div className="detail-item">
                                            <div className="detail-icon">📅</div>
                                            <div className="detail-content">
                                                <span className="detail-label">Fecha</span>
                                                <span className="detail-value">
                                                    {formatearFecha(gastoSeleccionado.fecha)}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <div className="detail-item">
                                            <div className="detail-icon">💰</div>
                                            <div className="detail-content">
                                                <span className="detail-label">Valor</span>
                                                <span className="detail-value highlight">
                                                    {formatearCantidad(gastoSeleccionado.cantidad)}
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
                                            disabled={!formGasto.categoria_id || !formGasto.cantidad}
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

export default ListadoGastos;
