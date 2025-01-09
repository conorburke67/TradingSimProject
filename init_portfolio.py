import sqlite3
from datetime import datetime

# Database connection
def get_db_connection():
    conn = sqlite3.connect('portfolio.db')
    conn.row_factory = sqlite3.Row
    return conn

# Portfolio Data
portfolio = [
    {"stock": "ADBE", "price": 444.68, "shares": 5},
    {"stock": "ASML", "price": 693.08, "shares": 3},
    {"stock": "AMZN", "price": 219.39, "shares": 11},
    {"stock": "BABA", "price": 84.79, "shares": 28},
    {"stock": "LITE", "price": 83.95, "shares": 28},
    {"stock": "CCJ", "price": 51.39, "shares": 78},
    {"stock": "ENB", "price": 42.43, "shares": 94},
    {"stock": "ALLY", "price": 36.01, "shares": 74},
    {"stock": "BAC", "price": 43.95, "shares": 61},
    {"stock": "ARCC", "price": 21.89, "shares": 122},
    {"stock": "DKNG", "price": 37.20, "shares": 67},
    {"stock": "RH", "price": 393.59, "shares": 6},
    {"stock": "COST", "price": 916.27, "shares": 3},
    {"stock": "GM", "price": 53.27, "shares": 47},
    {"stock": "MRK", "price": 99.48, "shares": 24},
    {"stock": "BSX", "price": 89.32, "shares": 27},
    {"stock": "MDGL", "price": 308.57, "shares": 8},
    {"stock": "JNJ", "price": 144.62, "shares": 17},
    {"stock": "HQY", "price": 95.95, "shares": 25},
    {"stock": "VCEL", "price": 54.91, "shares": 44},
    {"stock": "SBGSY", "price": 36.00, "shares": 111},
    {"stock": "STLD", "price": 114.07, "shares": 35},
    {"stock": "BRBR", "price": 75.34, "shares": 53},
    {"stock": "COIN", "price": 248.30, "shares": 12},
    {"stock": "PLD", "price": 105.70, "shares": 47},
    {"stock": "NEE", "price": 71.69, "shares": 69},
    {"stock": "FCX", "price": 38.00, "shares": 131}
]

# Insert trades and update the database
def initialize_portfolio():
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # Clear the tables before adding new data
        cursor.execute('DELETE FROM trades')
        cursor.execute('DELETE FROM aggregated_trades')
        conn.commit()
        print("Tables cleared.")

        for entry in portfolio:
            asset = entry["stock"]
            quantity = entry["shares"]
            price = entry["price"]
            action = "Buy"  # All entries are "Buy" actions
            time = datetime.now().isoformat()

            # Insert into trades table
            cursor.execute('''
                INSERT INTO trades (asset, quantity, time, price, action)
                VALUES (?, ?, ?, ?, ?)
            ''', (asset, quantity, time, price, action))

            # Check if asset exists in aggregated_trades table
            cursor.execute('''
                SELECT quantity, average_price FROM aggregated_trades WHERE asset = ?
            ''', (asset,))
            row = cursor.fetchone()

            if row:
                current_quantity, current_avg_price = row
                # Update quantity and calculate new average price
                new_quantity = current_quantity + quantity
                new_avg_price = ((current_avg_price * current_quantity) + (price * quantity)) / new_quantity

                # Update aggregated_trades
                cursor.execute('''
                    UPDATE aggregated_trades
                    SET quantity = ?, average_price = ?
                    WHERE asset = ?
                ''', (new_quantity, new_avg_price, asset))
            else:
                # Insert new record into aggregated_trades
                cursor.execute('''
                    INSERT INTO aggregated_trades (asset, quantity, average_price)
                    VALUES (?, ?, ?)
                ''', (asset, quantity, price))

        # Commit the changes
        conn.commit()
        print("Portfolio has been successfully initialized.")
    except Exception as e:
        print(f"Error initializing portfolio: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    initialize_portfolio()
