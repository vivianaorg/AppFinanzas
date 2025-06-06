// FormularioAgregarTransaccion.jsx
import './FormularioAgregarTransaccion.css';

const FormularioAgregarTransaccionJSX = ({
    error,
    tipoTransaccion,
    setTipoTransaccion,
    fecha,
    setFecha,
    categorias,
    categoria,
    setCategoria,
    mostrarAgregarCategoria,
    setMostrarAgregarCategoria,
    nuevaCategoria,
    setNuevaCategoria,
    agregarCategoria,
    importe,
    setImporte,
    comentarios,
    setComentarios,
    guardarTransaccion,
    loading,
}) => {
    // Función para formatear la fecha
    const formatearFecha = (fechaString) => {
        const fecha = new Date(fechaString);
        const opciones = { day: 'numeric', month: 'long', year: 'numeric' };
        return fecha.toLocaleDateString('es-ES', opciones);
    };

    return (
        <div className="formulario-container">
            {error && <div className="error-message">{error}</div>}

            <div className="formulario-header">
                <h1 className="formulario-titulo">Nueva Transacción</h1>
            </div>

            <div className="tipo-transaccion-container">
                <label className="tipo-transaccion-label">Tipo de Transacción</label>
                <div className="tipo-transaccion-buttons">
                    <button
                        className={`tipo-btn ingresos ${tipoTransaccion === 'Ingresos' ? 'active' : ''}`}
                        onClick={() => setTipoTransaccion('Ingresos')}
                    >
                        💰 Ingresos
                    </button>
                    <button
                        className={`tipo-btn gastos ${tipoTransaccion === 'Gastos' ? 'active' : ''}`}
                        onClick={() => setTipoTransaccion('Gastos')}
                    >
                        💸 Gastos
                    </button>
                    <button
                        className={`tipo-btn ahorros ${tipoTransaccion === 'Ahorros' ? 'active' : ''}`}
                        onClick={() => setTipoTransaccion('Ahorros')}
                    >
                        🏦 Ahorros
                    </button>
                </div>
            </div>

            <div className="form-grid">
                <div className="form-column">
                    <div className="campo-grupo">
                        <label className="campo-label">Fecha</label>
                        <input
                            type="date"
                            value={fecha}
                            onChange={(e) => setFecha(e.target.value)}
                            className="campo-input"
                        />
                    </div>

                    <div className="campo-grupo">
                        <label className="campo-label">Categoría</label>
                        <div className="categoria-container">
                            <select
                                value={categoria}
                                onChange={(e) => setCategoria(e.target.value)}
                                className="categoria-select"
                            >
                                {categorias.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.nombre}
                                    </option>
                                ))}
                            </select>

                            <button
                                onClick={() => setMostrarAgregarCategoria(true)}
                                className="agregar-categoria-btn"
                            >
                                <span className="plus-icon">+</span>
                                Agregar nueva categoría
                            </button>
                        </div>

                        {mostrarAgregarCategoria && (
                            <div className="nueva-categoria-container">
                                <input
                                    type="text"
                                    value={nuevaCategoria}
                                    onChange={(e) => setNuevaCategoria(e.target.value)}
                                    className="campo-input"
                                    placeholder="Nombre de la nueva categoría"
                                />
                                <button
                                    onClick={agregarCategoria}
                                    className="btn-guardar"
                                    style={{ marginTop: '16px', width: '100%' }}
                                >
                                    ✨ Crear Categoría
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="form-column">
                    <div className="campo-grupo">
                        <label className="campo-label">Comentarios</label>
                        <textarea
                            value={comentarios}
                            onChange={(e) => setComentarios(e.target.value)}
                            className="comentarios-textarea"
                            placeholder="Describe tu transacción..."
                        />
                    </div>
                </div>

                <div className="campo-grupo importe-container">
                    <label className="campo-label">Importe</label>
                    <div className="importe-container">
                        <span className="peso-symbol">$</span>
                        <input
                            type="number"
                            value={importe}
                            onChange={(e) => setImporte(e.target.value)}
                            className="importe-input"
                            min="0"
                            placeholder="0.00"
                        />
                    </div>
                </div>
            </div>

            <div className="botones-container">
                <button className="btn-cancelar">
                    ✕ Cancelar
                </button>
                <button
                    className="btn-guardar"
                    onClick={guardarTransaccion}
                    disabled={loading}
                >
                    {loading ? "⏳ Guardando..." : "💾 Guardar Transacción"}
                </button>
            </div>
        </div>
    );
};

export default FormularioAgregarTransaccionJSX;