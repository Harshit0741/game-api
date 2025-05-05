
# Crypto Crash Game Backend

This is the backend for the "Crypto Crash" game, where players place bets in USD, which are converted into a cryptocurrency (e.g., BTC or ETH) using real-time prices. The game features a multiplier that increases over time, and players can cash out at any point before the round "crashes" to win the amount multiplied by the current multiplier.

## Table of Contents
1. [Setup Instructions](#setup-instructions)
2. [API Endpoints](#api-endpoints)
    - [Place Bet](#place-bet)
    - [Check Player Balance](#check-player-balance)
    - [Cashout](#cashout)
3. [WebSocket Events](#websocket-events)
4. [Provably Fair Crash Algorithm](#provably-fair-crash-algorithm)
5. [Cryptocurrency Integration and Price Fetching](#cryptocurrency-integration-and-price-fetching)
6. [Game Logic Overview](#game-logic-overview)

## Setup Instructions

### 1. Clone the Repository
Clone this repository to your local machine:
```
git clone https://github.com/Harshit0741/game-api.git
cd crypto-crash-backend
```

### 2. Install Dependencies
Run the following command to install the required packages:
```
npm install
```

### 3. Set Up Environment Variables
You need to set up the following environment variables:

- `MONGODB_URI`: MongoDB connection URI (e.g., for MongoDB Atlas or local database).
- `CRYPTO_API_KEY`: API key for the chosen cryptocurrency API (e.g., CoinGecko, CoinMarketCap).

Create a `.env` file in the root directory and add the following:
```
MONGODB_URI=<your-mongodb-uri>
CRYPTO_API_KEY=<your-crypto-api-key>
```

### 4. Run the Application
To start the server, run:
```
npm start
```
The server will run on `http://localhost:3000`.

## Postman Collection
You can test the Crypto Crash API using the following [Postman](https://harshit-6003987.postman.co/workspace/harshit's-Workspace~bb3b2062-7320-454a-8fde-febd3854d040/collection/43825972-ba032cde-ace9-4324-888a-510f52550ac0?action=share&creator=43825972) collection link.

## API Endpoints

### Place Bet
**POST** `/api/place-bet`

This endpoint allows a player to place a bet in USD, which will be converted to the chosen cryptocurrency.

**Request Body**:
```json
{
  "playerId": "playerId123",
  "usdAmount": 10,
  "currency": "BTC"
}
```

**Response**:
```json
{
  "success": true
}
```

---

### Check Player Balance
**GET** `/api/player-balance/:playerId`

This endpoint checks a player's wallet balance in both cryptocurrency and USD equivalent.

**Request Params**:
- `playerId`: The player's unique identifier.

**Response**:
```json
{
  "cryptoBalance": 0.0005,
  "usdBalance": 30
}
```

---

### Cashout
**POST** `/api/cashout`

This endpoint allows a player to cash out their winnings during a round.

**Request Body**:
```json
{
  "playerId": "playerId123"
}
```

**Response**:
```json
{
  "success": true,
  "payout": "0.00025579",
  "multiplier": "2.42"
}
```

---

## WebSocket Events

WebSocket communication is used to broadcast game events in real-time to all connected clients. Events include:

### round_start
Triggered when a new round begins.

**Payload**:
```json
{
  "roundId": "round123"
}
```

### multiplier_update
Triggered when the multiplier is updated during the round.

**Payload**:
```json
{
  "multiplier": "1.05"
}
```

### player_cashout
Triggered when a player cashes out.

**Payload**:
```json
{
  "playerId": "playerId123",
  "payout": "0.00025579",
  "multiplier": "2.42"
}
```

### round_crash
Triggered when the round crashes and the final crash point is reached.

**Payload**:
```json
{
  "crashPoint": 3.42
}
```

---

## Provably Fair Crash Algorithm

The crash point for each round is determined using a provably fair algorithm. This ensures transparency and fairness for all players.

1. A random seed is generated at the start of the round.
2. The crash point is calculated using the formula:
   ```
   crashPoint = hash(seed + roundNumber) % maxCrashValue
   ```
3. The crash point is calculated before the round starts and is made public to players for transparency.
4. Players can verify the fairness of the crash point by using the seed and the round number.

---

## Cryptocurrency Integration and Price Fetching

The backend integrates with a cryptocurrency API (e.g., CoinGecko, CoinMarketCap) to fetch real-time prices for supported cryptocurrencies.

### Price Fetching Logic
- The price for the selected cryptocurrency is fetched when a player places a bet or cashes out.
- USD-to-crypto conversion is done using the fetched price. For example:
  - If a player bets $10 in BTC and the current BTC price is $60,000, the crypto amount will be:
    ```
    10 / 60000 = 0.00016667 BTC
    ```

### Handling Prices
- Prices are cached for 10 seconds to avoid excessive API calls.
- When a player cashes out, the crypto amount is multiplied by the current multiplier and converted back to USD for display.

---

## Game Logic Overview

### Game Flow
1. **New Round**: A new round begins every 10 seconds. The multiplier starts at 1x and increases exponentially.
2. **Bets**: Players place bets in USD, which are converted to cryptocurrency.
3. **Multiplier Update**: The multiplier increases over time, and players are notified in real-time via WebSockets.
4. **Crash Point**: The game randomly crashes at a multiplier determined by the provably fair algorithm.
5. **Cashout**: Players can cash out at any time before the round crashes to win their bet multiplied by the current multiplier.
6. **End of Round**: If a player does not cash out before the crash, they lose their bet.

---


