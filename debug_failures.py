#!/usr/bin/env python3
"""
Debug specific test failures to achieve 100% success rate
"""

import requests
import sys

class DebugTester:
    def __init__(self, base_url="https://0de79f73-880e-4b75-b873-cf862a9b62ec.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None

    def login(self):
        """Login to get token"""
        url = f"{self.api_url}/auth/login"
        data = {'email': 'brightboxm@gmail.com', 'password': 'admin123'}
        
        try:
            response = requests.post(url, json=data)
            if response.status_code == 200:
                result = response.json()
                self.token = result['access_token']
                print(f"✅ Login successful, token: {self.token[:20]}...")
                return True
            else:
                print(f"❌ Login failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"❌ Login error: {str(e)}")
            return False

    def test_unauthorized_access(self):
        """Test unauthorized access to projects endpoint"""
        print("\n🔍 Testing unauthorized access to projects...")
        
        url = f"{self.api_url}/projects"
        
        # Test without token
        try:
            response = requests.get(url)
            print(f"Response status: {response.status_code}")
            print(f"Response headers: {dict(response.headers)}")
            print(f"Response text: {response.text[:200]}...")
            
            if response.status_code in [401, 403]:
                print("✅ Correctly rejected unauthorized request")
                return True
            else:
                print(f"❌ Expected 401 or 403, got {response.status_code}")
                return False
                
        except Exception as e:
            print(f"❌ Request error: {str(e)}")
            return False

    def test_invalid_pdf_file(self):
        """Test invalid PDF file upload"""
        print("\n🔍 Testing invalid PDF file upload...")
        
        if not self.token:
            print("❌ No token available")
            return False
        
        url = f"{self.api_url}/pdf-processor/extract"
        headers = {'Authorization': f'Bearer {self.token}'}
        files = {'file': ('test.txt', b'not a pdf file', 'text/plain')}
        
        try:
            response = requests.post(url, headers=headers, files=files)
            print(f"Response status: {response.status_code}")
            print(f"Response text: {response.text[:500]}...")
            
            if response.status_code == 400:
                print("✅ Correctly rejected invalid PDF file")
                return True
            else:
                print(f"❌ Expected 400, got {response.status_code}")
                return False
                
        except Exception as e:
            print(f"❌ Request error: {str(e)}")
            return False

    def run_debug_tests(self):
        """Run debug tests for the 2 failing cases"""
        print("🔍 Debugging the 2 failing test cases...")
        print("=" * 60)
        
        # Login first
        if not self.login():
            return False
        
        # Test the 2 failing cases
        test1_result = self.test_unauthorized_access()
        test2_result = self.test_invalid_pdf_file()
        
        print("\n" + "=" * 60)
        print(f"📊 Debug Results:")
        print(f"Test 1 (Unauthorized access): {'PASS' if test1_result else 'FAIL'}")
        print(f"Test 2 (Invalid PDF file): {'PASS' if test2_result else 'FAIL'}")
        
        return test1_result and test2_result

def main():
    tester = DebugTester()
    success = tester.run_debug_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())