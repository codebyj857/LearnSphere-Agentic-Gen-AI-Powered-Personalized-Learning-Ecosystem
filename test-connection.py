#!/usr/bin/env python3
"""
Test script to verify backend connection and CORS setup
"""

import requests
import json

def test_backend_connection():
    """Test backend connection and endpoints"""
    base_url = "http://localhost:5001"
    
    print("🔍 Testing LearnSphere Backend Connection...")
    print(f"📡 Base URL: {base_url}")
    
    # Test 1: Basic health check
    try:
        response = requests.get(f"{base_url}/", timeout=5)
        print(f"✅ Root endpoint: {response.status_code}")
    except requests.exceptions.ConnectionError as e:
        print(f"❌ Root endpoint failed: {e}")
        return False
    except Exception as e:
        print(f"❌ Root endpoint error: {e}")
        return False
    
    # Test 2: CORS preflight
    try:
        response = requests.options(f"{base_url}/api/signup", timeout=5)
        print(f"✅ CORS preflight: {response.status_code}")
        print(f"📋 CORS headers: {dict(response.headers)}")
    except Exception as e:
        print(f"❌ CORS preflight failed: {e}")
    
    # Test 3: Signup endpoint
    try:
        test_data = {
            "name": "Test User",
            "email": "test@example.com",
            "password": "testpass123"
        }
        headers = {
            "Content-Type": "application/json",
            "Origin": "http://localhost:3000"
        }
        response = requests.post(f"{base_url}/api/signup", 
                              json=test_data, 
                              headers=headers, 
                              timeout=5)
        print(f"✅ Signup endpoint: {response.status_code}")
        if response.status_code == 201:
            print("🎉 Signup working correctly!")
            print(f"📄 Response: {response.json()}")
        else:
            print(f"⚠️  Unexpected status: {response.text}")
    except Exception as e:
        print(f"❌ Signup endpoint failed: {e}")
    
    # Test 4: Login endpoint
    try:
        login_data = {
            "email": "test@example.com",
            "password": "testpass123"
        }
        response = requests.post(f"{base_url}/api/login", 
                              json=login_data, 
                              headers=headers, 
                              timeout=5)
        print(f"✅ Login endpoint: {response.status_code}")
        if response.status_code == 200:
            print("🎉 Login working correctly!")
            print(f"📄 Response: {response.json()}")
        else:
            print(f"⚠️  Unexpected status: {response.text}")
    except Exception as e:
        print(f"❌ Login endpoint failed: {e}")
    
    print("\n🔧 Troubleshooting Tips:")
    print("1. Make sure backend is running: python app_simple.py")
    print("2. Check if port 5001 is free: netstat -an | grep 5001")
    print("3. Verify CORS settings in app_simple.py")
    print("4. Check firewall/antivirus blocking localhost connections")
    print("5. Try different browser or incognito mode")

if __name__ == "__main__":
    test_backend_connection()
