import React, { useRef, useEffect, useState } from 'react';
import '../styles/Dashboard.css'; // Import the CSS file
import 'chartjs-adapter-date-fns';
import TickerSearch from './TickerSearch';
import Dropdown from './Dropdown';
import TradeButtons from './TradeButtons';
import { formatPrice, formatTimestamp } from '../api/api';

import {
    Chart,
    LineController,
    LineElement,
    PointElement,
    TimeSeriesScale,
    LinearScale,
    Title,
    CategoryScale,
    Tooltip
} from 'chart.js';

const calculateTimeSettings = (period) => {
    switch (period) {
        case '1d':
        case '5d':
            return { unit: 'hour', displayFormat: 'MMM d, h a' };
        case '1mo':
            return { unit: 'day', displayFormat: 'MMM d' };
        case '3mo':
        case '6mo':
            return { unit: 'week', displayFormat: 'MMM d' };
        case '1y':
        case '2y':
            return { unit: 'month', displayFormat: 'MMM yyyy' };
        case '5y':
        case '10y':
        case 'max':
            return { unit: 'year', displayFormat: 'yyyy' };
        default:
            return { unit: 'month', displayFormat: 'MMM yyyy' };
    }
};

Chart.register(LineController, LineElement, PointElement, TimeSeriesScale, LinearScale, Title, CategoryScale, Tooltip);

function Dashboard({ data, ticker, onTickerChange, onPeriodChange, onIntervalChange, makeTradeAPI }) {
    const canvasRef = useRef(null);
    const transformedData = {
        labels: Object.keys(data), // Use the keys (dates) as labels
        datasets: [
            {
                label: 'Stock Price',
                data: Object.values(data), // Use the values (prices) as data
                borderColor: 'rgba(75, 192, 192, 1)', // Line color
                fill: false // Ensure the area under the line is not filled
            }
        ]
    };

    useEffect(() => {
        const ctx = canvasRef.current.getContext('2d');
        const timeSettings = calculateTimeSettings(selectedPeriod);

        const chart = new Chart(ctx, {
            type: 'line',
            data: transformedData,
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        displayColors: false,
                        enabled: true,
                        mode: 'nearest',
                        intersect: false,
                        callbacks: {
                            label: (tooltipItem) => {
                                return `${formatPrice(tooltipItem.raw)}`;
                            }
                        }
                    },
                    title: {
                        display: true,
                        text: `${ticker} Stock Price`,
                        font: {
                            size: 18
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'timeseries',
                        time: {
                            unit: timeSettings.unit,
                            displayFormats: {
                                [timeSettings.unit]: timeSettings.displayFormat
                            }
                        },
                        ticks: {
                            autoSkip: true,
                            maxTicksLimit: 6
                        },
                        title: {
                            display: true,
                            text: 'Date'
                        },
                        grid: {
                            color: 'rgba(200, 200, 200, 0.3)'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Price (USD)'
                        },
                        ticks: {
                            callback: (value) => `${formatPrice(value)}`
                        },
                        grid: {
                            color: 'rgba(200, 200, 200, 0.3)'
                        }
                    }
                }
            }
        });

        return () => {
            chart.destroy(); // Cleanup on component unmount
        };
    }, [data, ticker]);

    const periods = ["1d", "5d", "1mo", "3mo", "6mo", "1y", "2y", "5y", "10y", "ytd", "max"];
    const [intervals, setIntervals] = useState(["1m", "2m", "5m", "30m", "1h"]);
    const [selectedInterval, setSelectedInterval] = useState("1d"); // Track selected interval
    const [selectedPeriod, setSelectedPeriod] = useState("1y"); // Track selected interval

    useEffect(() => {
        setSelectedInterval(intervals[0]); // Update selected interval when intervals change
    }, [intervals]);

    const handleIntervalChange = (newInterval) => {
        setSelectedInterval(newInterval); // Update local state
        onIntervalChange(newInterval); // Notify parent of the change
    };

    const makeTrade = (quantity, action) => {
        makeTradeAPI(ticker, quantity, action);
    }

    const updateIntervalRange = (periodValue) => {
        if (periodValue === "1d" || periodValue === "5d") {
            onIntervalChange("1m");
            setIntervals(["1m", "2m", "5m", "30m", "1h"]);
        }
        else if (periodValue === "1mo") {
            onIntervalChange("5m");
            setIntervals(["5m", "30m", "1h", "1d"]);
        }
        else if (periodValue === "3mo" || periodValue === "6mo") {
            onIntervalChange("1h");
            setIntervals(["1h", "1d", "1wk"]);
        }
        else if (periodValue === "1y" || periodValue === "2y") {
            onIntervalChange("1h");
            setIntervals(["1h", "1d", "1wk", "1mo"]);
        }
        else {
            onIntervalChange("1d");
            setIntervals(["1d", "1wk", "1mo", "3mo"]);
        }
    }

    const updatePeriodAndIntervalRange = (newPeriodValue) => {
        updateIntervalRange(newPeriodValue);
        setSelectedPeriod(newPeriodValue);
        onPeriodChange(newPeriodValue);
    };

    return (
        <div className="DashBoard">
            <canvas ref={canvasRef} />
            <div className="dashButtons">
                <TickerSearch onTickerChange={onTickerChange} />
                <Dropdown key={"PeriodDD"} name={"Period"} items={periods} onChange={updatePeriodAndIntervalRange} value={selectedPeriod} />
                <Dropdown key={"IntervalDD"} name={"Interval"} items={intervals} onChange={handleIntervalChange} value={selectedInterval} />
            </div>
            <TradeButtons makeTrade={makeTrade} />
        </div>
    );
}

export default Dashboard;
