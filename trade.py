from enum import Enum
from datetime import datetime
from typing import Optional

class ActionType(Enum):
    BUY = "Buy"
    SELL = "Sell"
    SHORT = "Short"

class TradeType(Enum):
    STOCK = "Stock"
    CURRENCY = "Currency"
    COMMODITY = "Commodity"

class Trade:
    
    def __init__(self, asset: str, time: datetime, quantity: int, price: float, trade_type: TradeType, 
                 action: ActionType, short_date: Optional[datetime] = None,
                 base_currency: Optional[str] = None, quote_currency: Optional[str] = None, 
                 unit: Optional[str] = None):
        self.asset = asset
        self.time = time
        self.quantity = quantity
        self.price = price
        self.trade_type = trade_type
        self.action = action
        self.short_date = short_date if action == ActionType.SHORT else None
        self.base_currency = base_currency if trade_type == TradeType.CURRENCY else None
        self.quote_currency = quote_currency if trade_type == TradeType.CURRENCY else None
        self.unit = unit if trade_type == TradeType.COMMODITY else None
    
    def __repr__(self):
        details = f"{self.action.value} {self.quantity} units of {self.asset} ({self.trade_type.value}) at {self.price} on {self.time}"
        if self.trade_type == TradeType.CURRENCY:
            details += f", Currency Pair: {self.base_currency}/{self.quote_currency}"
        if self.trade_type == TradeType.COMMODITY:
            details += f", Unit: {self.unit}"
        if self.action == ActionType.SHORT:
            details += f", Short Date: {self.short_date}"
        return details
    
    def to_dict(self):
        return {
            "Asset": self.asset,
            "Quantity": self.quantity,
            "Price": self.price,
            "Trade Type": self.trade_type.value,
            "Action": self.action.value,
            "Time": self.time,
            "Short Date": self.short_date,
            "Base Currency": self.base_currency,
            "Quote Currency": self.quote_currency,
            "Unit": self.unit
        }
