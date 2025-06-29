#!/usr/bin/env python3

import requests
import json

def test_access_history():
    base_url = "http://localhost:5000"
    headers = {"X-API-Key": "SECRET123"}
    
    # Test the health endpoint first
    try:
        response = requests.get(f"{base_url}/health")
        print(f"✅ Health check: {response.status_code}")
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return
    
    # Test the user access history endpoint
    try:
        response = requests.get(f"{base_url}/user_access_history/user1", headers=headers)
        print(f"✅ Access history endpoint: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"📊 Found {len(data)} access records for user1")
            if data:
                print(f"📝 Sample record: {data[0]}")
        else:
            print(f"❌ Error: {response.text}")
    except Exception as e:
        print(f"❌ Access history test failed: {e}")

if __name__ == "__main__":
    test_access_history() 