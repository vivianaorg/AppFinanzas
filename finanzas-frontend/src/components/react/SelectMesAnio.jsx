import * as React from 'react';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

const SelectMesAnio = ({ tipo, valor, setValor }) => {
  const nombresMeses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const anioActual = new Date().getFullYear();
  const años = Array.from({ length: 11 }, (_, i) => anioActual - 5 + i);

  const opciones = tipo === 'mes'
    ? nombresMeses.map((nombre, index) => ({ valor: index + 1, texto: nombre }))
    : años.map(anio => ({ valor: anio, texto: anio }));

  const etiqueta = tipo === 'mes' ? 'Mes' : 'Año';

  return (
    <Box sx={{ minWidth: 120 }}>
      <FormControl fullWidth>
        <InputLabel id={`select-${tipo}-label`}>{etiqueta}</InputLabel>
        <Select
          labelId={`select-${tipo}-label`}
          id={`select-${tipo}`}
          value={valor}
          label={etiqueta}
          onChange={(e) => setValor(Number(e.target.value))}
        >
          {opciones.map((op) => (
            <MenuItem key={op.valor} value={op.valor}>
              {op.texto}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default SelectMesAnio;
