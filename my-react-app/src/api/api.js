export const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    }).replace(',', '');
};

export const formatPrice = (price) => {
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
    });

    return formatter.format(price);
};

export const formatPercent = (num) => {
    return new Intl.NumberFormat('en-US', {
        style: 'percent',
        maximumFractionDigits: 2
    }).format(num);
}

export const fetchTradeHistory = (setRows) => {
    fetch('http://127.0.0.1:5000/api/tradehistory')
        .then((response) => response.json())
        .then((data) => {
            const formattedRows = data.map((trade) => {
                return [
                    trade['Asset'],
                    trade['Quantity'],
                    formatTimestamp(trade['Time']),
                    formatPrice(trade['Price']),
                    trade['Action'],
                ];
            }
            );
            setRows(formattedRows);
        })
        .catch((error) => {
            console.error('Error fetching trade history:', error);
        });
};

export const makeTrade = async (ticker, quantity, action, fetchTradeHistory) => {
    try {
        const response = await fetch('http://127.0.0.1:5000/api/maketrade', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ asset: ticker, quantity, action }),
        });

        if (!response.ok) {
            // Handle HTTP errors (e.g., 4xx or 5xx)
            const errorData = await response.json();
            throw new Error(`Error: ${response.status} - ${errorData.message || 'Something went wrong'}`);
        }

        // Parse JSON response for successful requests
        const data = await response.json();
        console.log('Trade successful:', data);
        fetchTradeHistory();
        return data;

    } catch (error) {
        console.error('Error making trade:', error.message);
        throw error; // Re-throw error if you want the caller to handle it
    }
};

export const fetchChartData = async (newTicker, period, interval, setChartData) => {
    try {
        const response = await fetch('http://127.0.0.1:5000/api/getdata', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ Ticker: newTicker, Period: period, Interval: interval }),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const chartData = await response.json();
        if (Object.keys(chartData).length === 0) {
            throw new Error('Received empty data from the server');
        }
        setChartData(chartData); // Update chart data
        console.log(`Chart data loaded for: ${newTicker}`);
        return true;
    } catch (error) {
        console.error('Error fetching chart data:', error);
        alert(`Failed to load chart data: ${error.message}`);
        return false;
    }
};

export const getCurrPrice = async (ticker) => {
    try {
        const response = await fetch('http://127.0.0.1:5000/api/getassetprice', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ Ticker: ticker }),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        return data["Price"];
    } catch (error) {
        console.error(`Error fetching current price of ${ticker}`);
        alert(`Failed to load current price: ${error.message}`);
        throw error;
    }
}

export const getChange = async (ticker) => {
    try {
        const response = await fetch('http://127.0.0.1:5000/api/getchange', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ Ticker: ticker }),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Error fetching change of ${ticker}`);
        alert(`Failed to load change: ${error.message}`);
        throw error;
    }
}

export const fetchAcctBalance = async () => {
    try {
        const response = await fetch('http://127.0.0.1:5000/api/getbalance');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        return formatPrice(data["Balance"]);

    } catch (error) {
        console.error('Error fetching account balance:', error);
    }
}

export const fetchAggData = async (setRows, setAcctBalance, setPNL) => {
    try {
        const response = await fetch('http://127.0.0.1:5000/api/aggregate');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        const acctBalance = await fetchAcctBalance();
        let pnl = 0;

        // Use Promise.all to wait for all async getCurrPrice calls
        const formattedRows = await Promise.all(
            data.map(async (trade) => {
                const currPrice = await getCurrPrice(trade['Asset']);
                const changes = await getChange(trade['Asset']);
                const asset_pnl = trade['Quantity'] * (currPrice - trade['Average_Price']);
                pnl += asset_pnl;
                return [
                    trade['Asset'],
                    trade['Quantity'],
                    formatPrice(trade['Average_Price']),
                    formatPrice(currPrice),
                    formatPercent(changes["Day"]),
                    formatPercent(changes["Year"]),
                    formatPrice(asset_pnl)
                ];
            })
        );

        setRows(formattedRows);
        setAcctBalance(acctBalance);
        setPNL(formatPrice(pnl));
    } catch (error) {
        console.error('Error fetching aggregate portfolio:', error);
    }
};

export const fetchAggStats = async () => {
    try {
        const response = await fetch('http://127.0.0.1:5000/api/getaggstats');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching aggregate stats:', error);
    }
};

export const fetchStockData = async (ticker) => {
    try {
        const response = await fetch('http://127.0.0.1:5000/api/getstockinfo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ Ticker: ticker }),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching aggregate stats:', error);
    }
}