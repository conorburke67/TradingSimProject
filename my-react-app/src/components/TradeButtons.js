import React, { useState, useEffect } from 'react';
import Dropdown from './Dropdown';

function TradeButtons({ makeTrade }) {
    const [quantity, setQuantity] = useState('0');
    const [action, setAction] = useState('Buy');

    const handleInputChange = (event) => {
        const value = event.target.value;
        const numericValue = parseFloat(value);
        if (!isNaN(numericValue) && numericValue > 0) {
            setQuantity(numericValue);
        } else if (value === '') {
            setQuantity('0');
        }
    };

    return (
        <div style={{
            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px'
        }}>
            <label id="tradebutton-label"> Quantity </label>
            <input
                type="number"
                min="1"
                step="1"
                onChange={handleInputChange}
            />
            <label id="tradebutton-label"> Action </label>
            <Dropdown items={["Buy", "Sell", "Short"]} onChange={setAction} />
            <button onClick={() => makeTrade(quantity, action)}>Make Trade</button>
        </div >
    );
}

export default TradeButtons;