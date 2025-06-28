# Blockchain Module - Honeytoken Registry

This module provides a Solidity smart contract and scripts for registering and verifying honeytokens on the Polygon Amoy testnet.

## 📦 Prerequisites

- [Node.js](https://nodejs.org/) (v16+ recommended)
- [npm](https://www.npmjs.com/)
- [Hardhat](https://hardhat.org/)
- Polygon Amoy testnet account with POL tokens (get from [Polygon Faucet](https://faucet.polygon.technology/))
- (Optional) [MetaMask](https://metamask.io/) for contract interaction

## 🚀 Setup

1. **Install dependencies**
   ```bash
   cd blockchain
   npm install
   ```

2. **Configure Environment Variables**

   Create a `.env` file in the `blockchain` directory with the following:
   ```
   AMOY_RPC_URL=https://rpc-amoy.polygon.technology
   PRIVATE_KEY=your_private_key_here
   POLYGONSCAN_API_KEY=your_polygonscan_api_key_here
   ```
   - Replace `your_private_key_here` with your wallet's private key (never share this publicly).
   - Get a Polygonscan API key from [Polygonscan](https://polygonscan.com/myapikey).

## 🛠️ Usage

### 1. Compile the Contract

```bash
npx hardhat compile
```

### 2. Deploy to Polygon Amoy

```bash
npx hardhat run scripts/deploy.js --network amoy
```
- The deployed contract address will be printed in the console.

### 3. Interact with the Contract

Edit `scripts/interact.js` to set the correct contract address, then run:
```bash
npx hardhat run scripts/interact.js --network amoy
```
- This script demonstrates registering and verifying a honeytoken.

### 4. Verify Contract on Polygonscan (Optional)

```bash
npx hardhat verify --network amoy <DEPLOYED_CONTRACT_ADDRESS>
```

## 📂 File Structure

- `contracts/HoneytokenRegistry.sol` — Solidity contract for honeytoken registration
- `scripts/deploy.js` — Script to deploy the contract
- `scripts/interact.js` — Script to interact with the contract
- `hardhat.config.js` — Hardhat configuration for Polygon Amoy

## 🧪 Testing

To run tests (if any are present):
```bash
npx hardhat test
```

## 📝 Notes

- Ensure your wallet has enough POL for gas fees.
- Never commit your private key or `.env` file to version control.
