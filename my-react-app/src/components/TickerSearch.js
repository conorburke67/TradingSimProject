import React, { useState } from 'react';

function TickerSearch({ onTickerChange }) {
    const [inputValue, setInputValue] = useState(''); 

    const handleInputChange = (event) => {
        setInputValue(event.target.value); 
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') { 
            handleSubmit();
        }
    };

    const handleSubmit = () => {
        onTickerChange(inputValue.toUpperCase());
        console.log(`Selected Ticker: ${inputValue.toUpperCase()}`);
        setInputValue(''); 
    };

    return (
        <div>
            <input
                id="textInput"
                type="text"
                value={inputValue} 
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Ticker"
            />
        </div>
    );
}

export default TickerSearch;
