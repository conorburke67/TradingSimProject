import yfinance as yf
from flask import jsonify

stock = yf.Ticker("AAPL")
curr_price = stock.info
for x in curr_price.keys():
    print(x)

print(stock.info["52WeekChange"])
# # print(stock.info["sector"])


# price = stock.info["currentPrice"]
# print(price)
# history = stock.history(period="1d", interval="1m")
# print(history['Close'][-1])

# history = stock.history(period="1y", interval="1d")['Close']
# history_dict = {str(date): price for date, price in history.items()}
# print(jsonify(hi))

# industry, sector, 

