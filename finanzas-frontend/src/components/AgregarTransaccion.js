import React, { useState } from 'react';
import FormularioAgregarTransaccion from './FormularioAgregarTransaccion';

const PaginaAgregarTransaccion = () => {
  const [transaccionGuardada, setTransaccionGuardada] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(true);

  const handleSave = (transaccion) => {
    setTransaccionGuardada(transaccion);
    setMostrarFormulario(false);
    // Puedes redirigir al usuario o mostrar un mensaje de éxito
  };

  const handleClose = () => {
    // Redirigir al usuario a la página anterior o a la lista de transacciones
    window.history.back();
  };

  return (
    <div className="container mx-auto p-4">
      
      {mostrarFormulario ? (
        <FormularioAgregarTransaccion 
          onSave={handleSave} 
          onClose={handleClose} 
        />
      ) : (
        <div className="bg-green-100 text-green-800 p-4 rounded-md">
          <p>¡Transacción guardada correctamente!</p>
          <button 
            className="bg-green-600 text-white py-2 px-4 rounded-md mt-2"
            onClick={() => setMostrarFormulario(true)}
          >
            Agregar otra transacción
          </button>
          <button 
            className="bg-blue-600 text-white py-2 px-4 rounded-md mt-2 ml-2"
            onClick={handleClose}
          >
            Volver
          </button>
        </div>
      )}
    </div>
  );
};

export default PaginaAgregarTransaccion;