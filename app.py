from flask import Flask, jsonify, request, g
from datetime import datetime
from enum import Enum
import sqlite3
import yfinance as yf
from flask_cors import CORS
import logging

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:3000", "http://127.0.0.1:3000"]}})
logging.basicConfig(level=logging.INFO)

start_amount = 100000

class ActionType(Enum):
    BUY = "Buy"
    SELL = "Sell"
    SHORT = "Short"

# Database connection
def get_db_connection():
    conn = sqlite3.connect('portfolio.db')
    conn.row_factory = sqlite3.Row
    return conn

@app.before_request
def open_connection():
    g.db = get_db_connection()

@app.teardown_request
def close_connection(exception):
    db = getattr(g, 'db', None)
    if db is not None:
        db.close()

# Create tables
with get_db_connection() as conn:
    cursor = conn.cursor()
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS trades (
        id INTEGER PRIMARY KEY,
        asset TEXT,
        quantity REAL,
        time TEXT,
        price REAL,
        action TEXT
    )
    ''')
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS aggregated_trades (
        asset TEXT PRIMARY KEY,
        quantity REAL,
        average_price REAL
    )
    ''')
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS portfolio_history (
        date TEXT PRIMARY KEY,
        quantity REAL,
        average_price REAL
    )
    ''')

    conn.commit()

@app.route('/api/maketrade', methods=['POST'])
def add_trade():
    try:
        data = request.json
        asset = data['asset']
        quantity = float(data['quantity'])
        action = ActionType(data['action'])
        stock = yf.Ticker(asset)
        price = stock.info["currentPrice"]
        time = datetime.now().isoformat()

        cursor = g.db.cursor()
        cursor.execute('''
            INSERT INTO trades (asset, quantity, time, price, action)
            VALUES (?, ?, ?, ?, ?)
        ''', (asset, quantity, time, price, action.value))

        cursor.execute('''
            SELECT quantity, average_price FROM aggregated_trades WHERE asset = ?
        ''', (asset,))
        row = cursor.fetchone()

        if row:
            current_quantity, current_avg_price = row
            if action == ActionType.BUY:
                new_quantity = current_quantity + quantity
                new_avg_price = ((current_avg_price * current_quantity) + (price * quantity)) / new_quantity
            elif action == ActionType.SELL:
                new_quantity = current_quantity - quantity
                new_avg_price = current_avg_price

            cursor.execute('''
                UPDATE aggregated_trades
                SET quantity = ?, average_price = ?
                WHERE asset = ?
            ''', (new_quantity, new_avg_price, asset))
        else:
            cursor.execute('''
                INSERT INTO aggregated_trades (asset, quantity, average_price)
                VALUES (?, ?, ?)
            ''', (asset, quantity, price))

        g.db.commit()
        return jsonify({'message': 'Trade added successfully'}), 201

    except Exception as e:
        logging.error(f"Error adding trade: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/tradehistory', methods=['GET'])
def get_all_trades():
    cursor = g.db.cursor()
    cursor.execute('SELECT * FROM trades')
    rows = cursor.fetchall()
    trades = [
        {
            'id': row['id'],
            'Asset': row['asset'],
            'Quantity': row['quantity'],
            'Time': row['time'],
            'Price': row['price'],
            'Action': row['action']
        } for row in rows
    ]
    return jsonify(trades)

@app.route('/api/aggregate', methods=['GET'])
def get_aggregated_trades():
    cursor = g.db.cursor()
    cursor.execute('SELECT * FROM aggregated_trades')
    rows = cursor.fetchall()
    aggregated = [
        {
            'Asset': row['asset'],
            'Quantity': row['quantity'],
            'Average_Price': row['average_price']
        } for row in rows
    ]
    return jsonify(aggregated)

def is_valid_ticker(symbol):
    """
    Check if a stock ticker is valid by verifying it has historical data.
    """
    try:
        stock = yf.Ticker(symbol)
        history = stock.history(period="1d")  # Fetch 1 day of history
        if history.empty:
            return False
        return True
    except Exception:
        return False
    
@app.route('/api/getdata', methods=['GET', 'POST'])
def get_data():
    # Get the request JSON body
    specs = request.json

    # Validate the input
    if 'Ticker' not in specs:
        return jsonify({"error": "Ticker symbol is required"}), 400

    ticker_symbol = specs['Ticker']

    # Check if the ticker is valid
    if not is_valid_ticker(ticker_symbol):
        return jsonify({"error": f"Invalid ticker symbol: {ticker_symbol}"}), 400

    # Fetch historical data
    stock = yf.Ticker(ticker_symbol)
    history = stock.history(period=specs['Period'], interval=specs['Interval'])['Close']
    history_dict = {str(date): price for date, price in history.items()}

    return jsonify(history_dict), 200

@app.route('/api/getassetprice', methods=['GET', 'POST'])
def get_asset_price():
    try:
        # Ensure the request body is JSON
        if not request.is_json:
            return jsonify({"error": "Request must be JSON"}), 400
        
        specs = request.json
        
        # Validate Ticker in request
        if 'Ticker' not in specs or not specs['Ticker']:
            return jsonify({"error": "Ticker symbol is required"}), 400

        ticker = specs['Ticker']
        
        # Fetch stock data
        stock = yf.Ticker(ticker)
        price = stock.info["currentPrice"]

        return jsonify({"Price": price}), 200
    
    except Exception as e:
        # Log the error and return a generic message
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

@app.route('/api/getchange', methods=['GET', 'POST'])
def get_change():
    try:
        # Ensure the request body is JSON
        if not request.is_json:
            return jsonify({"error": "Request must be JSON"}), 400
        
        specs = request.json
        
        # Validate Ticker in request
        if 'Ticker' not in specs or not specs['Ticker']:
            return jsonify({"error": "Ticker symbol is required"}), 400

        ticker = specs['Ticker']
        stock = yf.Ticker(ticker)
        info = stock.info
        current_price = info['currentPrice']  # Current market price
        previous_close = info['regularMarketPreviousClose']  # Previous close price

        # Calculate daily percentage change
        daily_percent_change = ((current_price - previous_close) / previous_close)
        year_change = info['52WeekChange']

        return jsonify({"Day": daily_percent_change, "Year" : year_change}), 200
    
    except Exception as e:
        # Log the error and return a generic message
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

@app.route('/api/getbalance', methods=['GET'])
def get_balance():
    balance = start_amount
    cursor = g.db.cursor()
    cursor.execute("SELECT * FROM trades")
    rows = cursor.fetchall()
    balance += sum(row['quantity'] * row['price'] * (2* (row['action'] != "Buy") - 1) for row in rows)
    return jsonify({"Balance" : balance})

@app.route('/api/getaggstats', methods=['GET'])
def get_agg_stats():
    cursor = g.db.cursor()
    cursor.execute('SELECT * FROM aggregated_trades')
    rows = cursor.fetchall()
    industries = {}
    sectors = {}
    total = 0
    for row in rows:
        stock = yf.Ticker(row['asset'])
        sec = stock.info['sector']
        change = stock.info['52WeekChange']
        total += row['quantity'] * row['average_price']
        if sec not in sectors:
            sectors[sec] = {}
        sectors[sec]["value"] = sectors[sec].get("value", 0) + (row['quantity'] * row['average_price'])
        sectors[sec]["change"] = sectors[sec].get("change", 0) + (row['quantity'] * row['average_price'] * change)
        ind = stock.info['industry']
        if sec not in industries:
            industries[sec] = {}
        industries[sec][ind] = industries[sec].get(ind, 0) + (row['quantity'] * row['average_price'])

    for key in sectors:
        sectors[key]["change"] /= sectors[key]["value"]
        sectors[key]["value"] /= total
    
    for key in industries:
        for x in industries[key]:
            industries[key][x] /= total            

    return jsonify({"industries": industries, "sectors": sectors})

@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        response = Flask.response_class()
        response.headers["Access-Control-Allow-Origin"] = "http://localhost:3000"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        return response

@app.route('/')
def home():
    return "<h1>Welcome to the Flask App</h1><p>Available endpoints:</p><ul><li><a href='/api/tradehistory'>/api/tradehistory</a></li><li><a href='/api/aggregate'>/api/aggregate</a></li></ul>"

if __name__ == '__main__':
    app.run(debug=True)
