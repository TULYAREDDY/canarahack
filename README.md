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
  "timestamp": "iso8601"
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