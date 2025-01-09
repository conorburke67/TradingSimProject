import React, { useState, useEffect } from 'react';

function Dropdown({ name, items, onChange }) {
    const [selectedValue, setSelectedValue] = useState('');

    const handleChange = (event) => {
        const value = event.target.value;
        setSelectedValue(value);
        console.log('Selected value:', value);

        if (onChange) {
            onChange(value);
        }
    };

    return (
        <div>
            <label id="dropdown-label"> {name} </label>
            <select id="dropdown" value={selectedValue} onChange={handleChange}>
                {items.map((item, index) => (
                    <option key={index} value={item}>
                        {item}
                    </option>
                ))}
            </select>
        </div>
    );
}

export default Dropdown;
