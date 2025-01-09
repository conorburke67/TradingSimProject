import React from 'react';

function Row({ data }) {
  return (
    <tr>
      {data.map((cell, index) => (
        <td key={index}>{cell}</td>
      ))}
    </tr>
  );
}

export default Row;