import React, { useState } from 'react';
import '../styles/Portfolio.css';
import { fetchStockData, formatPrice } from '../api/api';

function Row({ data }) {

  const [expand, setExpand] = useState(false);
  const [expandedContent, setExpandedContent] = useState(null); // Store fetched data

  const setStockData = async (ticker) => {
    try {
      const data = await fetchStockData(ticker);
      if (data) {
        setExpandedContent(
          <td className="expandedRow" colSpan={7}>
            <div className="expanded-content">
              <strong>{data.info.longName}</strong> | {data.info.sector} | {data.info.industry}
              <hr />
              <div className="expanded-metrics">
                <div className="metrics-group">
                  <strong>Valuation Metrics:</strong>
                  <ul>
                    <li>PEG Ratio: {data.info.trailingPegRatio}</li>
                    <li>Price to Book: {data.info.priceToBook}</li>
                    <li>Trailing P/E: {data.info.trailingPE}</li>
                    <li>Forward P/E: {data.info.forwardPE}</li>
                  </ul>
                </div>
                <div className="metrics-group">
                  <strong>Financial Health Metrics:</strong>
                  <ul>
                    <li>Current Ratio: {data.info.currentRatio}</li>
                    <li>Debt to Equity: {data.info.debtToEquity}</li>
                  </ul>
                </div>
                <div className="metrics-group">
                  <strong>Growth Metrics:</strong>
                  <ul>
                    <li>Revenue Growth: {data.info.revenueGrowth}</li>
                    <li>Earnings Growth: {data.info.earningsGrowth}</li>
                  </ul>
                </div>
                <div className="metrics-group">
                  <strong>Industry Views:</strong>
                  <ul>
                    <li>Median Target Price: {formatPrice(data.info.targetMedianPrice)}</li>
                    <li>Buy: {data.recommendations.buy[0] + data.recommendations.strongBuy[0]}</li>
                    <li>Hold: {data.recommendations.hold[0]}</li>
                    <li>Sell: {data.recommendations.sell[0] + data.recommendations.strongSell[0]}</li>
                  </ul>
                </div>
              </div>
            </div>
          </td>

        );
      }
    } catch (error) {
      console.error("Error in setStockData:", error);
      setExpandedContent("Error fetching data");
    }
  };

  const handleExpand = () => {
    setExpand(!expand);
    if (!expand) {
      const ticker = data[0];
      setStockData(ticker);
    }
  };

  return (
    <React.Fragment>
      <tr onClick={() => handleExpand()}>
        {data.map((cell, index) => (
          <td key={index}>{cell}</td>
        ))}
      </tr>
      {expand && (
        <tr>
          {/* Render fetched content */}
          {expandedContent || <td className="expandedRow" colSpan={7}> Loading... </td>}
        </tr>
      )}
    </React.Fragment>
  );
}

export default Row;