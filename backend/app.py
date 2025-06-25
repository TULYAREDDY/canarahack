from flask import Flask, jsonify, request
from flask_cors import CORS
from watermarking.generator import generate_watermark
from honeytokens.schema import generate_honeytoken
from policy.metadata_format import generate_policy

app = Flask(__name__)
CORS(app)

@app.route('/health')
def health():
    """Health check endpoint."""
    return jsonify({
        "status": "running",
        "service": "Data Sentinel Backend",
        "version": "1.0.0",
        "message": "Backend is healthy and ready!"
    })

@app.route('/generate_watermark', methods=['POST'])
def api_generate_watermark():
    data = request.get_json()
    content = data.get('content')
    partner_id = data.get('partner_id')
    if not content or not partner_id:
        return jsonify({"error": "Missing content or partner_id"}), 400
    hash_value = generate_watermark(content, partner_id)
    return jsonify({"watermark": hash_value})

@app.route('/generate_honeytoken', methods=['GET'])
def api_generate_honeytoken():
    token = generate_honeytoken()
    return jsonify(token)

@app.route('/generate_policy', methods=['POST'])
def api_generate_policy():
    data = request.get_json()
    purpose = data.get('purpose')
    days_valid = data.get('days_valid')
    region = data.get('region')
    if not purpose or days_valid is None or not region:
        return jsonify({"error": "Missing purpose, days_valid, or region"}), 400
    try:
        days_valid = int(days_valid)
    except ValueError:
        return jsonify({"error": "days_valid must be an integer"}), 400
    policy = generate_policy(purpose, days_valid, region)
    return jsonify(policy)

if __name__ == '__main__':
    app.run(port=5000) 