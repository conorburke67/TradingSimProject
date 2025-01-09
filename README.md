# Trading Simulator Project

<!-- ABOUT THE PROJECT -->
## About The Project

This project aims to replicate a platform where you can monitor the market, analyze your portfolio, and make trades. 
Currently, you are able to:
* View market data of all equities listed on the NYSE
* View all of the trades that you have made
* Buy/Sell Equities for your portfolio with real-time data
* View your aggregate portfolio and unrealized P/L
* View the sector breakdown and breakdown within your portfolio

In the future, I aim to create features so that you will be able to:
* View the value of your portfolio and balance over time
* View risk metrics and other analytics of your portfolio
* View the performance of the market
* Click on individual assets with your portfolio to see a more detailed description

### Built With

* Flask
* React.js
* sqlite3
* yfinance


<!-- GETTING STARTED -->
## Getting Started

### Prerequisites
* npm
  ```sh
  npm install npm@latest -g
  ```
* SQLite
    * Windows: Download the precompiled binaries from the official SQLite download page, extract the files, and add the directory containing sqlite3.exe to your system's PATH environment variable.
    * macOS:
    ```sh
    brew install sqlite
    ```
    * Linux:
    ```sh
    sudo apt-get update
    sudo apt-get install sqlite3 libsqlite3-dev
    ```
    Verify the installation:
    ```sh
    sqlite3 --version
    ```

### Installation
1. Clone the repo
   ```sh
   git clone https://github.com/conorburke67/TradingSimProject.git
   ```
2. Install NPM packages
   ```sh
   npm install
   ```
3. Start the backend server
    ```sh
    python app.py
    ```
4. Start the frontend application
    ```
    npm start
    ```

<!-- CONTACT -->
## Contact

Conor Burke - conortburke11@gmail.com

Project Link: [https://github.com/conorburke67/TradingSimProject](https://github.com/conorburke67/TradingSimProject)
