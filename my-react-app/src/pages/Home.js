import React, { useEffect, useState } from 'react';
import '../styles/App.css';
import Table from '../components/Table';
import Dashboard from '../components/Dashboard';
import { fetchTradeHistory, makeTrade, fetchChartData } from '../api/api';

function Home() {
    const headers = ['Asset', 'Quantity', 'Time', 'Price', 'Action'];
    const [rows, setRows] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [ticker, setTicker] = useState('NVDA');
    const [period, setPeriod] = useState('1y');
    const [interval, setInterval] = useState('1d');

    const handleFetchTradeHistory = () => {
        fetchTradeHistory(setRows); // Pass setRows to update rows state
    };

    const handleMakeTrade = async (ticker, quantity, action) => {
        try {
            await makeTrade(ticker, quantity, action, handleFetchTradeHistory);
        } catch (error) {
            console.error(error.message);
        }
    };

    const handleFetchChartData = async (newTicker, period, interval) => {
        const success = await fetchChartData(newTicker, period, interval, setChartData);
        if (success) {
            console.log('Chart data fetched successfully');
        }
        return success; // Return success to propagate the result
    };


    // Fetch trade history
    useEffect(() => {
        handleFetchTradeHistory();
    }, []);

    // Fetch chart data when the ticker changes
    useEffect(() => {
        if (ticker) {
            handleFetchChartData(ticker, period, interval);
        }
    }, [ticker, period, interval]);

    const onTickerChange = async (newTicker) => {
        const isValid = await handleFetchChartData(newTicker, period, interval);
        if (isValid) {
            setTicker(newTicker);
        }
    };

    return (
        <div className="App">
            <header className="App-header">
                <h1>My Portfolio Project</h1>
                <Dashboard data={chartData} ticker={ticker} onTickerChange={onTickerChange} onPeriodChange={setPeriod} onIntervalChange={setInterval} makeTradeAPI={handleMakeTrade} />
            </header>
            <h1>Trade History</h1>
            <Table headers={headers} rows={rows} />
        </div>
    );
}

export default Home;