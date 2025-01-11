import React, { useEffect, useState, useRef } from 'react';
import Table from '../components/Table';
import { fetchAggData, fetchAggStats, formatPercent } from '../api/api';
import {
    Chart,
    PieController,
    ArcElement,
    Tooltip,
    Legend,
    BarController,
    BarElement
} from 'chart.js';
import '../styles/Portfolio.css';

function Portfolio() {
    const headers = ['Asset', 'Quantity', 'Average Purchase Price', 'Current Price', 'Daily % Change', 'Year % Change', 'Profit/Loss'];
    const [aggRows, setAggRows] = useState([]);
    const [acctBalance, setAcctBalance] = useState('$0');
    const [pnl, setPNL] = useState('$0');

    const [sectors, setSectors] = useState([]);
    const [counts, setCounts] = useState([]);
    const [industries, setIndustries] = useState({});
    const [sectorChanges, setSectorChanges] = useState([]);
    const predefinedColors = [
        '#FF6384', // Red
        '#36A2EB', // Blue
        '#FFCE56', // Yellow
        '#4BC0C0', // Teal
        '#9966FF', // Purple
        '#FF9F40', // Orange
        '#FFCD56', // Light Yellow
        '#C9CBCF', // Gray
        '#A569BD', // Lavender
        '#61D4B3'  // Mint Green
    ];
    const colors = predefinedColors.slice(0, sectors.length);

    Chart.register(PieController, ArcElement, Tooltip, Legend, BarController, BarElement);

    useEffect(() => {
        const fetchData = async () => {
            const stats = await fetchAggStats();
            if (stats) {
                setSectors(Object.keys(stats['sectors']));
                const sectorDicts = stats['sectors'];
                const values = Object.values(sectorDicts)
                    .map((sector) => sector["value"])
                    .filter((value) => value !== undefined);
                setCounts(values);
                const changes = Object.values(sectorDicts)
                    .map((sector) => sector["change"] * 100)
                    .filter((value) => value !== undefined);
                setSectorChanges(changes)
                setIndustries(stats['industries']);
            }
        };
        fetchData();
    }, []);


    const pieData = {
        labels: sectors, // Labels for each segment
        datasets: [
            {
                label: 'Portfolio Sector Allocation',
                data: counts, // Data points corresponding to the labels
                backgroundColor: colors,
                borderWidth: 1 // Border width
            }
        ]
    };

    const changeData = {
        labels: sectors,
        datasets: [
            {
                label: 'Portfolio Sector Changes',
                data: sectorChanges,
                backgroundColor: colors,
                borderWidth: 1
            }
        ]
    }

    const pieCanvasRef = useRef(null);
    const changesCanvasRef = useRef(null);

    useEffect(() => {
        const ctx = changesCanvasRef.current.getContext('2d');
        const chart = new Chart(ctx, {
            type: 'bar',
            data: changeData,
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: `Portfolio Sector Yearly Change`,
                        font: {
                            size: 18
                        }
                    },
                    tooltip: {
                        displayColors: false,
                        callbacks: {
                            label: (tooltipItem) => {
                                const pct = formatPercent(tooltipItem.raw / 100)
                                return "Yearly Change: " + pct;
                            }
                        }
                    }
                }
            }
        });

        return () => {
            if (chart) {
                chart.destroy(); // Destroy the existing chart
            }
        };
    }, [changeData]);

    useEffect(() => {
        const ctx = pieCanvasRef.current.getContext('2d');
        const chart = new Chart(ctx, {
            type: 'pie',
            data: pieData,
            options: {
                responsive: true,
                plugins: {
                    tooltip: {
                        enabled: true,
                        mode: 'nearest',
                        intersect: false,
                        displayColors: false,
                        callbacks: {
                            title: (tooltipItems) => {
                                return tooltipItems[0].label + ": " + formatPercent(tooltipItems[0].raw);
                            },
                            label: (tooltipItem) => {
                                const lines = [];
                                if (industries && industries[tooltipItem.label]) {
                                    Object.entries(industries[tooltipItem.label]).forEach(([key, value]) => {
                                        lines.push(`${key}: ${formatPercent(value)}`);
                                    });
                                }
                                return lines.length > 0 ? lines : ["No data available"];
                            }
                        }
                    },
                    title: {
                        display: true,
                        text: `Portfolio Sector Value Breakdown`,
                        font: {
                            size: 18
                        }
                    }
                }
            }
        });

        return () => {
            if (chart) {
                chart.destroy(); // Destroy the existing chart
            }
        };
    }, [pieData]);


    const handleFetchAggData = () => {
        fetchAggData(setAggRows, setAcctBalance, setPNL); // Pass setRows to update rows state
    };

    useEffect(() => {
        handleFetchAggData();
    }, []);

    return (
        <div className="App">
            <h1>Portfolio</h1>
            <label>Balance: {acctBalance} </label>
            <label>Unrealized P/L: {pnl}</label>
            <Table headers={headers} rows={aggRows} />
            <div className='chartSection'>
                <canvas ref={pieCanvasRef} />
                <canvas ref={changesCanvasRef} />
            </div>
        </div>
    );
}

export default Portfolio;