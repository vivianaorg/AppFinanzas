// ListadoIngresos.jsx
import React from "react";
import { Link } from "react-router-dom";
import "./ListadoIngresos.css";
import GraficoIngresos from "../GraficoIngresos";

const ListadoIngresos = ({
    mes,
    anio,
    ingresos,
    totalIngresos,
    loading,
    error,
    categorias,
    ingresoSeleccionado,
    mostrarModal,
    editando,
    setEditando,
    formIngreso,

    // Handlers
    handleMesAnterior,
    handleMesSiguiente,
    abrirModal,
    cerrarModal,
    iniciarEdicion,
    guardarEdicion,
    handleCategoriaChange,

    // Utilitarios
    nombresMeses,
    formatearCantidad,
    formatearFecha,
}) => {
    // Agrupar ingresos por categoría
    const ingresosPorCategoria = ingresos.reduce((acc, ingreso) => {
        const categoria = ingreso.categoria_nombre || "Sin categoría";
        acc[categoria] = (acc[categoria] || 0) + ingreso.cantidad;
        return acc;
    }, {});

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
                                <h3 className="card-title">Historial de Ingresos</h3>
                                {loading ? (
                                    <p className="cargando-text">Cargando ingresos...</p>
                                ) : ingresos.length > 0 ? (
                                    <div className="table-responsive">
                                        <table className="table-ingresos">
                                            <thead>
                                                <tr>
                                                    <th>Categoría</th>
                                                    <th className="text-end">Valor</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {ingresos.map((ingreso, index) => (
                                                    <tr key={index}>
                                                        <td>
                                                            <span
                                                                onClick={() => abrirModal(ingreso)}
                                                                className="link-categoria"
                                                            >
                                                                {ingreso.categoria_nombre || "Sin categoría"}
                                                            </span>
                                                        </td>
                                                        <td className="text-end">
                                                            {formatearCantidad(ingreso.cantidad)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="sin-datos">
                                        No hay ingresos para mostrar en este período.
                                    </p>
                                )}
                            </div>

                            {/* Total de Ingresos */}
                            <div className="total-card">
                                <h3>Total de Ingresos</h3>
                                <h2>{formatearCantidad(totalIngresos)}</h2>
                            </div>
                        </div>
                    </div>

                    {/* LADO DERECHO: Gráfico de Ingresos */}
                    <div className="lado-derecho">
                        <h3 className="card-title">Gráfico de Ingresos</h3>
                        <section className="grafico-section">
                            <div className="card-grafico">
                                <GraficoIngresos mes={mes} anio={anio} />
                            </div>
                        </section>
                    </div>
                </section>
            </main>

            {/* ─────── MODAL DETALLE DE INGRESO ─────── */}
            {mostrarModal && ingresoSeleccionado && (
                <div className="modal-backdrop">
                    <div className="modal-dialog-custom">
                        <div className="modal-content-custom">
                            <div className="modal-header-custom">
                                <h5 className="modal-title">Detalles del Ingreso</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={cerrarModal}
                                />
                            </div>
                            <div className="modal-body-custom">
                                <p>
                                    <strong>Categoría:</strong>{" "}
                                    {ingresoSeleccionado.categoria_nombre || "Sin categoría"}
                                </p>
                                <p>
                                    <strong>Fecha:</strong>{" "}
                                    {formatearFecha(ingresoSeleccionado.fecha)}
                                </p>
                                <p>
                                    <strong>Valor:</strong>{" "}
                                    {formatearCantidad(ingresoSeleccionado.cantidad)}
                                </p>
                                {editando && (
                                    <>
                                        <div className="mb-3">
                                            <label className="form-label">Categoría</label>
                                            <select
                                                className="form-select"
                                                value={formIngreso.categoria_id}
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
                                        <div className="mb-3">
                                            <label className="form-label">Cantidad</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                value={formIngreso.cantidad}
                                                onChange={(e) =>
                                                    formIngreso.id !== null &&
                                                    handleCategoriaChange({
                                                        target: { value: formIngreso.categoria_id },
                                                    }) // para la categoría, no es necesario aquí
                                                }
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Nueva cantidad</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                value={formIngreso.cantidad}
                                                onChange={(e) =>
                                                    formIngreso.id !== null &&
                                                    // AQUI SE ACTUALIZA CANTIDAD
                                                    formIngreso &&
                                                    (formIngreso.cantidad = e.target.value)
                                                }
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                            <div className="modal-footer-custom">
                                {editando ? (
                                    <>
                                        <button className="btn btn-success" onClick={guardarEdicion}>
                                            Guardar
                                        </button>
                                        <button
                                            className="btn btn-secondary"
                                            onClick={() => setEditando(false)}
                                        >
                                            Cancelar
                                        </button>
                                    </>
                                ) : (
                                    <button className="btn btn-primary" onClick={iniciarEdicion}>
                                        Editar
                                    </button>
                                )}
                                <button className="btn btn-secondary" onClick={cerrarModal}>
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

export default ListadoIngresos;
