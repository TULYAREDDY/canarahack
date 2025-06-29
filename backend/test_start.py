#!/usr/bin/env python3

try:
    from app import app
    print("✅ Backend imports successful!")
    print("✅ Flask app created successfully!")
    print("✅ Ready to start server on port 5000")
except Exception as e:
    print(f"❌ Error importing app: {e}")
    import traceback
    traceback.print_exc() 