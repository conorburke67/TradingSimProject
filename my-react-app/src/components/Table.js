import React from 'react';
import Row from './Row';

function Table({ headers, rows }) {
  return (
    <table>
      <thead>
        <tr>
          {headers.map((header, index) => (
            <th key={index}>{header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => (
          <Row key={index} data={row} />
        ))}
      </tbody>
    </table>
  );
}

export default Table;
