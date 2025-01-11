import yfinance as yf
from flask import jsonify

stock = yf.Ticker("AAPL")

company_name = stock.info.get('longName')
# print(company_name)

# recs = stock.recommendations_summary

# print(recs)

curr_price = stock.info

recs = stock.get_recommendations()
recs = recs.to_dict()
print(recs)

for x in recs:
    print(x)

# for x in curr_price.keys():
#     print(x, curr_price[x])
    

# print(stock.info["52WeekChange"])
# # print(stock.info["sector"])


# price = stock.info["currentPrice"]
# print(price)
# history = stock.history(period="1d", interval="1m")
# print(history['Close'][-1])

# history = stock.history(period="1y", interval="1d")['Close']
# history_dict = {str(date): price for date, price in history.items()}
# print(jsonify(hi))

# industry, sector, 

