#!/usr/bin/env python3

import requests
import json
import time

def test_enhanced_features():
    base_url = "http://localhost:5000"
    headers = {"X-API-Key": "SECRET123"}
    
    print("🧪 Testing Enhanced Features...")
    
    # Test 1: Check if user2 can now receive notifications
    print("\n1️⃣ Testing user2 notifications...")
    try:
        # First, make a partner request for user2
        partner_request = {
            "partner_id": "partner1",
            "region": "IN",
            "requested_users": ["user2"],
            "purpose": "testing_user2_notifications"
        }
        
        response = requests.post(f"{base_url}/partner_request_data", 
                               json=partner_request, headers=headers)
        print(f"   Partner request for user2: {response.status_code}")
        
        if response.status_code == 200:
            # Check if user2 got notifications
            time.sleep(1)  # Wait for notification processing
            notifications = requests.get(f"{base_url}/user_notifications?user_id=user2")
            if notifications.status_code == 200:
                user2_notifications = notifications.json()
                print(f"   ✅ User2 notifications: {len(user2_notifications)} found")
                if user2_notifications:
                    print(f"   📝 Latest notification: {user2_notifications[-1]['message']}")
                    print(f"   🎨 Level: {user2_notifications[-1].get('level', 'unknown')}")
            else:
                print(f"   ❌ Failed to get user2 notifications: {notifications.status_code}")
        else:
            print(f"   ❌ Partner request failed: {response.text}")
    except Exception as e:
        print(f"   ❌ Error testing user2: {e}")
    
    # Test 2: Test bulk partner requests
    print("\n2️⃣ Testing bulk partner requests...")
    try:
        bulk_request = {
            "requests": [
                {
                    "partner_id": "partner1",
                    "users": ["user1", "user2"],
                    "region": "IN",
                    "purpose": "bulk_test_1"
                },
                {
                    "partner_id": "partner2", 
                    "users": ["user1", "user3"],
                    "region": "IN",
                    "purpose": "bulk_test_2"
                }
            ]
        }
        
        response = requests.post(f"{base_url}/bulk_partner_request", 
                               json=bulk_request, headers=headers)
        print(f"   Bulk request: {response.status_code}")
        
        if response.status_code == 200:
            bulk_response = response.json()
            print(f"   ✅ Bulk response received for {len(bulk_response)} partners")
            for partner, users in bulk_response.items():
                print(f"   📊 {partner}: {len(users)} users processed")
        else:
            print(f"   ❌ Bulk request failed: {response.text}")
    except Exception as e:
        print(f"   ❌ Error testing bulk requests: {e}")
    
    # Test 3: Test enhanced admin endpoints
    print("\n3️⃣ Testing enhanced admin endpoints...")
    try:
        # Test admin trap logs
        trap_logs = requests.get(f"{base_url}/admin/trap_logs", headers=headers)
        print(f"   Admin trap logs: {trap_logs.status_code}")
        
        # Test admin restricted partners
        restricted = requests.get(f"{base_url}/admin/restricted_partners_detailed", headers=headers)
        print(f"   Admin restricted partners: {restricted.status_code}")
        
        # Test partner activity summary
        partner_summary = requests.get(f"{base_url}/admin/partner_activity_summary", headers=headers)
        print(f"   Partner activity summary: {partner_summary.status_code}")
        
        # Test user activity summary
        user_summary = requests.get(f"{base_url}/admin/user_activity_summary", headers=headers)
        print(f"   User activity summary: {user_summary.status_code}")
        
        if user_summary.status_code == 200:
            users = user_summary.json()
            print(f"   📊 User summary: {len(users)} users tracked")
            for user_id, data in users.items():
                print(f"   👤 {user_id}: {data.get('total_notifications', 0)} notifications, {data.get('threat_notifications', 0)} threats")
    except Exception as e:
        print(f"   ❌ Error testing admin endpoints: {e}")
    
    # Test 4: Test user escalation
    print("\n4️⃣ Testing user escalation...")
    try:
        escalation_request = {
            "user_id": "user1",
            "partner_id": "partner1",
            "reason": "Testing escalation feature"
        }
        
        response = requests.post(f"{base_url}/request_admin_action", 
                               json=escalation_request)
        print(f"   User escalation: {response.status_code}")
        
        if response.status_code == 200:
            escalation_response = response.json()
            print(f"   ✅ Escalation sent: {escalation_response.get('message', '')}")
            
            # Check if it appears in admin alerts
            time.sleep(1)
            admin_alerts = requests.get(f"{base_url}/alerts/admin")
            if admin_alerts.status_code == 200:
                alerts = admin_alerts.json()
                print(f"   📢 Admin alerts: {len(alerts)} total alerts")
                recent_escalations = [a for a in alerts if a.get('type') == 'user_escalation']
                print(f"   🚨 Recent escalations: {len(recent_escalations)}")
        else:
            print(f"   ❌ Escalation failed: {response.text}")
    except Exception as e:
        print(f"   ❌ Error testing escalation: {e}")
    
    # Test 5: Test notification levels
    print("\n5️⃣ Testing notification levels...")
    try:
        # Get all notifications to check levels
        all_notifications = requests.get(f"{base_url}/user_notifications")
        if all_notifications.status_code == 200:
            notifications = all_notifications.json()
            levels = {}
            for notif in notifications:
                level = notif.get('level', 'unknown')
                levels[level] = levels.get(level, 0) + 1
            
            print(f"   📊 Notification levels: {levels}")
            
            # Check for threat notifications
            threat_notifications = [n for n in notifications if n.get('level') == 'threat']
            print(f"   🚨 Threat notifications: {len(threat_notifications)}")
            
            # Check escalation capability
            escalatable = [n for n in notifications if n.get('can_escalate')]
            print(f"   ⚡ Escalatable notifications: {len(escalatable)}")
        else:
            print(f"   ❌ Failed to get notifications: {all_notifications.status_code}")
    except Exception as e:
        print(f"   ❌ Error testing notification levels: {e}")
    
    print("\n✅ Enhanced features test completed!")

if __name__ == "__main__":
    test_enhanced_features() 