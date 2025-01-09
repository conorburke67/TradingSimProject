import numpy as np
import pandas as pd
from enum import Enum
from datetime import datetime
import yfinance as yf

class ActionType(Enum):
    BUY = "Buy"
    SELL = "Sell"
    SHORT = "Short"

class TradeType(Enum):
    STOCK = "Stock"
    CURRENCY = "Currency"
    COMMODITY = "Commodity"

class Portfolio:
    def __init__(self):
        self.total_trades = 0
        all_trades_columns = ['Asset', 'Quantity', 'Time', 'Price', 'Trade Type', 'Action', 
                              'Short Date', 'Base Currency', 'Quote Currency', 'Unit']
        self.all_trades = pd.DataFrame(columns=all_trades_columns)
        self.unrealized_pnl = 0
        self.realized_pnl = 0
        agg_columns = ['Asset', 'Quantity', 'Average Price', 'Trade Type']
        self.aggregated_trades = pd.DataFrame(columns=agg_columns)

    def add_trade(self, asset, time, quantity, action):
        # Add trade to the list of all trades
        stock = yf.Ticker(asset)
        price = stock.info["currentPrice"]
        new_trade_row = {
            'Asset': asset, 'Quantity': quantity, 'Time': time, 'Price': price, 
            'Trade Type': TradeType.STOCK, 'Action': action, 'Short Date': None, 
            'Base Currency': None, 'Quote Currency': None, 'Unit': None
        }
        self.all_trades = pd.concat([self.all_trades, pd.DataFrame([new_trade_row])], ignore_index=True)
        self.total_trades += 1
        
        # Update aggregated trades
        existing_row = self.aggregated_trades[self.aggregated_trades['Asset'] == asset]

        if existing_row.empty:
            # Add a new asset entry
            new_agg_row = {
                'Asset': asset, 
                'Quantity': quantity, 
                'Average Price': price, 
                'Trade Type': TradeType.STOCK
            }
            self.aggregated_trades = pd.concat([self.aggregated_trades, pd.DataFrame([new_agg_row])], ignore_index=True)
        else:
            # Update existing asset entry
            index = existing_row.index[0]
            current_quantity = self.aggregated_trades.at[index, 'Quantity']
            current_avg_price = self.aggregated_trades.at[index, 'Average Price']

            if action == ActionType.BUY:
                if current_quantity < 0:  # Covering a short position
                    # Quantity to close out short
                    close_quantity = min(abs(current_quantity), quantity)
                    self.realized_pnl += close_quantity * (current_avg_price - price)

                    # Update remaining quantity
                    new_quantity = current_quantity + quantity

                    if new_quantity > 0:  # Flipping to a long position
                        new_avg_price = price
                    else:  # Short not fully covered
                        new_avg_price = current_avg_price

                    self.aggregated_trades.at[index, 'Quantity'] = new_quantity
                    self.aggregated_trades.at[index, 'Average Price'] = new_avg_price
                else:  # Adding to a long position
                    new_avg_price = ((current_avg_price * current_quantity) + (price * quantity)) / (current_quantity + quantity)
                    self.aggregated_trades.at[index, 'Average Price'] = new_avg_price
                    self.aggregated_trades.at[index, 'Quantity'] = current_quantity + quantity

            elif action == ActionType.SELL:
                if current_quantity > 0:  # Reducing a long position
                    close_quantity = min(current_quantity, quantity)
                    self.realized_pnl += close_quantity * (price - current_avg_price)

                    new_quantity = current_quantity - quantity

                    if new_quantity < 0:  # Flipping to a short position
                        new_avg_price = price
                    else:  # Long not fully closed
                        new_avg_price = current_avg_price

                    self.aggregated_trades.at[index, 'Quantity'] = new_quantity
                    self.aggregated_trades.at[index, 'Average Price'] = new_avg_price
                else:  # Adding to a short position
                    new_avg_price = ((current_avg_price * abs(current_quantity)) + (price * quantity)) / (abs(current_quantity) + quantity)
                    self.aggregated_trades.at[index, 'Average Price'] = new_avg_price
                    self.aggregated_trades.at[index, 'Quantity'] = current_quantity - quantity

            elif action == ActionType.SHORT:
                # Adding to or maintaining a short position
                new_avg_price = ((current_avg_price * abs(current_quantity)) + (price * quantity)) / (abs(current_quantity) + quantity)
                self.aggregated_trades.at[index, 'Average Price'] = new_avg_price
                self.aggregated_trades.at[index, 'Quantity'] = current_quantity - quantity


    def update_agg_trades(self, market_prices):
        self.unrealized_pnl = 0
        for _, row in self.aggregated_trades.iterrows():
            asset = row['Asset']
            quantity = row['Quantity']
            avg_price = row['Average Price']
            current_price = market_prices.get(asset, avg_price)  # Use avg_price if market price is unavailable

            # Calculate unrealized PnL for long and short positions
            if quantity > 0:  # Long position
                self.unrealized_pnl += quantity * (current_price - avg_price)
            elif quantity < 0:  # Short position
                self.unrealized_pnl += abs(quantity) * (avg_price - current_price)


    def to_dataframe(self):
        return self.all_trades
