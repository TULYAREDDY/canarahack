#!/usr/bin/env python3

import requests
import json

def test_cors_endpoints():
    base_url = "http://localhost:5000"
    
    # Test endpoints that were having CORS issues
    endpoints = [
        "/user_restricted_partners/user1",
        "/user_trap_logs/user1",
        "/user_notifications?user_id=user1",
        "/health"
    ]
    
    print("Testing CORS for user-facing endpoints...")
    
    for endpoint in endpoints:
        try:
            response = requests.get(f"{base_url}{endpoint}")
            print(f"✅ {endpoint}: {response.status_code}")
            if response.status_code == 200:
                data = response.json()
                print(f"   Response: {type(data)} with {len(data) if isinstance(data, (list, dict)) else 'data'}")
            else:
                print(f"   Error: {response.text}")
        except Exception as e:
            print(f"❌ {endpoint}: {e}")
    
    print("\nCORS test completed!")

if __name__ == "__main__":
    test_cors_endpoints() 