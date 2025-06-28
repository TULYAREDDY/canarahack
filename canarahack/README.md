# Data Sentinel Platform

A modular data security platform with a Flask backend and a React (Vite) frontend.  
Features include watermarking, honeytoken generation, policy metadata management, and a responsive dashboard UI.

---

## Project Structure

```
data-sentinel/
│
├── backend/
│   ├── app.py
│   ├── requirements.txt
│   ├── api/
│   │   └── auth.py
│   ├── watermarking/
│   │   └── generator.py
│   ├── honeytokens/
│   │   └── schema.py
│   └── policy/
│       └── metadata_format.py
│
└── frontend/
    ├── package.json
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── pages/
        │   └── Dashboard.jsx
        └── components/
            ├── Header.jsx
            ├── Footer.jsx
            ├── StatusBadge.jsx
            ├── WatermarkForm.jsx
            ├── HoneytokenViewer.jsx
            └── PolicyBuilder.jsx
```

---

## Features

### Backend (Flask)
- **/health**: Health check endpoint.
- **/generate_watermark**: Generate a SHA-256 watermark from content and partner ID.
- **/generate_honeytoken**: Generate a fake honeytoken record.
- **/generate_policy**: Build policy metadata with purpose, expiry, and region.

### Frontend (React + Vite)
- **Dashboard**: Responsive UI with modular components.
- **StatusBadge**: Shows backend health.
- **WatermarkForm**: Form to generate watermarks.
- **HoneytokenViewer**: Button to generate and view honeytokens.
- **PolicyBuilder**: Form to build and view policy metadata.

---

## Setup Instructions

### 1. Backend

**Install dependencies:**
```sh
cd backend
python -m venv venv
venv\Scripts\activate  # On Windows
pip install -r requirements.txt
```

**Run the backend:**
```sh
python app.py
```
- Runs on [http://localhost:5000](http://localhost:5000)

#### Backend Dependencies
- Flask
- flask-cors
- python-dotenv

---

### 2. Frontend

**Install dependencies:**
```sh
cd frontend
npm install
```

**Run the frontend:**
```sh
npm run dev
```
- Runs on [http://localhost:5173](http://localhost:5173)

#### Frontend Dependencies
- React
- React DOM
- Vite

---

## API Endpoints

### `GET /health`
Returns backend status.
```json
{
  "status": "running",
  "service": "Data Sentinel Backend",
  "version": "1.0.0",
  "message": "Backend is healthy and ready!"
}
```

### `POST /generate_watermark`
**Body:**  
```json
{ "content": "string", "partner_id": "string" }
```
**Response:**  
```json
{ "watermark": "sha256hash" }
```

### `GET /generate_honeytoken`
**Response:**  
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "record_id": "uuid",
  "timestamp": "iso8601",
  "onChainHash": "<bytes32>",
  "txHash": "<0x...>"
}
```

### `POST /generate_policy`
**Body:**  
```json
{ "purpose": "string", "days_valid": 30, "region": "string" }
```
**Response:**  
```json
{
  "purpose": "string",
  "expiry_date": "YYYY-MM-DD",
  "retention_policy": "standard",
  "geo_restriction": "string"
}
```

---

## Security

- Endpoints are currently public for demo purposes.
- To secure endpoints, use the `check_api_key` function in `backend/api/auth.py` and require an API key in requests.

---

## Customization

- Add more endpoints or UI features as needed.
- Integrate authentication, logging, or advanced policy logic for production use.

---

## License

MIT (or specify your license)

---

## Blockchain Layer (Honeytoken Verification)

A Solidity smart contract (`blockchain/contracts/HoneytokenRegistry.sol`) is used to register honeytoken hashes on the Polygon Mumbai testnet. Deployment scripts and configuration are in `blockchain/`. This enables decentralized, immutable verification of honeytoken creation and access events.

---

## Blockchain Dependencies

- `npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox`
- `pip install web3 python-dotenv`

---

## Blockchain Layer Setup

1. Install dependencies:
   ```bash
   cd blockchain
   npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
   ```
2. Compile and deploy the contract to Polygon Mumbai:
   ```bash
   npx hardhat compile
   npx hardhat run scripts/deploy.js --network mumbai
   ```
3. The deployed contract address will be saved to `blockchain/registry-address.json`. Copy this address to your `.env` as `HT_REGISTRY_ADDR`. 

---

## Blockchain Environment Variables

Add the following to your `.env` file in the project root:

```
MUMBAI_RPC_URL=https://polygon-mumbai.g.alchemy.com/v2/XXXX
WALLET_ADDR=0xYourPublicWallet
PRIVATE_KEY=yourPrivateKey
HT_REGISTRY_ADDR=0xDeployedAddress
```

---

## Blockchain Unit Testing

- Tests for blockchain registration and verification are in `tests/test_blockchain.py`.
- These tests mock-register a honeytoken and assert that `isRegistered` returns `True`.

---

## Blockchain Frontend Integration

- The React dashboard displays the on-chain transaction hash as a link to Polygonscan.
- When a honeytoken is triggered, the dashboard shows a modal with the honeytoken ID and a "Proof on Polygon (immutable)" link.

---

## Blockchain Backend Integration

- The backend uses `web3.py` to register honeytoken hashes on-chain and verify them.
- The `/generate_honeytoken` endpoint returns `onChainHash` and `txHash`.
- The backend utility is in `backend/blockchain/client.py`.

---

## Blockchain Contract Location

- The Solidity contract is in `blockchain/contracts/HoneytokenRegistry.sol`.
- Deployment scripts and config are in `blockchain/`.

---

## Blockchain Acceptance Criteria

- `/generate_honeytoken` returns `{ ..., "onChainHash": "<bytes32>", "txHash": "<0x...>" }`.
- Visiting the link shows the HoneytokenRegistered event on Polygonscan.
- Triggering the honeytoken displays "Verified fake record – proof on-chain" in the dashboard.
- All new code is covered by at least one unit test.

--- 